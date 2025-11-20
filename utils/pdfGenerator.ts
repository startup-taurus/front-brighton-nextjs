import { PDF_GENERATOR_CONSTANTS } from './constants';
import { STUDENT_REPORT_CONSTANTS } from './studentReportConstants';
import { StudentData } from '../Types/ReportTypes';
import { getCourseById, getCourseWithStudents, getGradingItems, getGradingPercentageBySyllabus } from '../helper/api-data/course';
import { getGradesByCourseAndStudent } from '../helper/api-data/student-grades';
import { getFinalPercentageBySyllabusId } from '../helper/api-data/syllabus';
import {
  buildGradebookStructure,
  calculateAssignmentAverage,
  calculateAverage,
  calculateStudentAverage,
  calculateReportExamAverage,
  calculateFinalGradingStatus,
  formatGradebookComponents,
  formatStudentScoreAssignmentsGrades,
  formatStudentScoreExamGrades,
  getExamType,
} from './utils';
import JSZip from 'jszip';
import { EXAMS_TYPE } from './constants';

const norm = (s?: string) =>
  (s || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const findRow = (rows: any[], name: string) =>
  rows?.find((r) => norm(r.criterion) === norm(name));

const pickYLE = (examRows: any[]) => {
  const readingWriting = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING_WRITING_ALT) || 
                        findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING_AND_WRITING);
  const listening = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.LISTENING);
  const speaking = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.SPEAKING);
  return {
    readingAndWriting: readingWriting?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
    readingAndWritingStatus: readingWriting?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
    listening: listening?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
    listeningStatus: listening?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
    speaking: speaking?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
    speakingStatus: speaking?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
  };
};

const pickGeneral = (examRows: any[]) => {
  const reading = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING);
  const listening = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.LISTENING);
  const writing = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.WRITING);
  const speaking = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.SPEAKING);
  return {
    reading: reading?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
    readingStatus: reading?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
    listening: listening?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
    listeningStatus: listening?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
    writing: writing?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
    writingStatus: writing?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
    speaking: speaking?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
    speakingStatus: speaking?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
  };
};

const isYLEorKEY = (t?: string) =>
  [EXAMS_TYPE.STARTERS, EXAMS_TYPE.MOVERS, EXAMS_TYPE.FLYERS, EXAMS_TYPE.KEY]
    .includes((t || "").toUpperCase());

class PDFLibLoader {
  private static instance: any = null;

  static async load() {
    if (!this.instance) {
      this.instance = await import('pdf-lib');
    }
    return this.instance;
  }
}

export const textFormatters = {
  formatStudentName: (fullName: string): string => {
    const formattedName = fullName.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    const names = formattedName.split(' ').filter(name => name.trim() !== '');
    if (names.length >= 4) {
      names[1] = names[1].charAt(0) + '.';
      names[3] = names[3].charAt(0) + '.';
    }
    return names.join(' ');
  },

  formatDate: (dateInput: string): string => {
    const [year, month, day] = dateInput.split('-');
    const monthName = PDF_GENERATOR_CONSTANTS.MONTHS[parseInt(month, 10) - 1];
    return `Manta, ${monthName} ${parseInt(day, 10)}, ${year}`;
  },

  generatePassStrings: (level: string, program: string, finalGrade: string) => {
    const passString1 = `has successfully PASSED the ${level.toUpperCase()} level of the`;
    let passString2 = `${program.toUpperCase()} program`;

    if (finalGrade === 'Distinction') {
      passString2 += ' WITH DISTINCTION.';
    } else if (finalGrade === 'Merit') {
      passString2 += ' WITH MERIT.';
    } else {
      passString2 += '.';
    }

    return { passString1, passString2 };
  },

  generateReportOverviewStrings: (studentData: StudentData) => {
    const fullName = studentData.student.toUpperCase();
    const names = fullName.split(' ');
    
    const reportOverviewString1 = `The undersigned coordinator of Brighton English School hereby certifies that ${names[0]} ${names[1]}`;
    const remainingNames = names.slice(2);
    const reportOverviewString2 = `${remainingNames.join(' ')} has successfully passed the ${studentData.level.toUpperCase()} level of the ${studentData.program.toUpperCase()}`;
    
    let reportOverviewString3 = 'program';
    if (studentData.final === 'Distinction') {
      reportOverviewString3 += ' WITH DISTINCTION.';
    } else if (studentData.final === 'Merit') {
      reportOverviewString3 += ' WITH MERIT.';
    } else {
      reportOverviewString3 += '.';
    }
    reportOverviewString3 += " The student's academic performance has been evaluated, and the";
    
    const reportOverviewString4 = 'attained grades are as follows:';

    return { reportOverviewString1, reportOverviewString2, reportOverviewString3, reportOverviewString4 };
  }
};

export const pdfUtils = {
  getBacksideFileName: (level: string): string => {
    const mappedLevel = (PDF_GENERATOR_CONSTANTS.LEVEL_MAPPING as Record<string, string>)[level];
    
    if (mappedLevel) {
      return mappedLevel;
    }
    
    const fallbackLevel = level.split('.')[0] || level.split(' ')[0];
    const availableLevels = ['A1', 'A2', 'B1', 'B2', 'PRE-A1'];
    return availableLevels.includes(fallbackLevel) ? fallbackLevel : 'A1';
  },

  loadFonts: async (pdfDoc: any) => {
    const fontkit = await import('@pdf-lib/fontkit');
    pdfDoc.registerFontkit(fontkit.default);

    const [brittanyFontBytes, poppinsFontBytes, bostonAngelFontBytes] = await Promise.all([
      fetch(PDF_GENERATOR_CONSTANTS.API_ENDPOINTS.FONTS.BRITTANY).then(res => res.arrayBuffer()),
      fetch(PDF_GENERATOR_CONSTANTS.API_ENDPOINTS.FONTS.POPPINS).then(res => res.arrayBuffer()),
      fetch(PDF_GENERATOR_CONSTANTS.API_ENDPOINTS.FONTS.BOSTON_ANGEL).then(res => res.arrayBuffer())
    ]);

    const [brittanyFont, poppinsFont, bostonAngelFont] = await Promise.all([
      pdfDoc.embedFont(brittanyFontBytes),
      pdfDoc.embedFont(poppinsFontBytes),
      pdfDoc.embedFont(bostonAngelFontBytes)
    ]);

    return { brittanyFont, poppinsFont, bostonAngelFont };
  },

  downloadPDF: (pdfBytes: Uint8Array, filename: string) => {
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

downloadZIP: (zipBytes: Uint8Array, filename: string) => {
  const blob = new Blob([zipBytes as any], { type: 'application/zip' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
},

  generatePDFBytes: async (studentData: StudentData, type: 'certificate' | 'report'): Promise<Uint8Array> => {
    const { PDFDocument } = await PDFLibLoader.load();

    if (type === 'certificate') {
      const existingPdfBytes = await fetch(PDF_GENERATOR_CONSTANTS.API_ENDPOINTS.CERTIFICATE).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const fonts = await pdfUtils.loadFonts(pdfDoc);
      const [firstPage] = pdfDoc.getPages();
      contentGenerators.drawCertificateContent(firstPage, studentData, fonts);

      const backsideLevel = studentData.shortLevel || studentData.level?.split(" ")[0] || "A1.1";
      const backsideFileName = pdfUtils.getBacksideFileName(backsideLevel);
      const backsidePdfBytes = await fetch(`/api/certificate/${backsideFileName} Backside.pdf`).then(res => res.arrayBuffer());
      const backsidePdfDoc = await PDFDocument.load(backsidePdfBytes);
      const [backsidePage] = await pdfDoc.copyPages(backsidePdfDoc, [0]);
      pdfDoc.addPage(backsidePage);

      return await pdfDoc.save();
    } else {
      const existingPdfBytes = await fetch(PDF_GENERATOR_CONSTANTS.API_ENDPOINTS.REPORT).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const { poppinsFont } = await pdfUtils.loadFonts(pdfDoc);
      const [firstPage] = pdfDoc.getPages();
      
      contentGenerators.drawReportHeader(firstPage, studentData, poppinsFont);
      contentGenerators.drawReportOverview(firstPage, studentData, poppinsFont);
      contentGenerators.drawAssignmentsSection(firstPage, studentData, poppinsFont);
      contentGenerators.drawExamSection(firstPage, studentData, poppinsFont);
      contentGenerators.drawReportFooter(firstPage, studentData, poppinsFont);

      return await pdfDoc.save();
    }
  }
};

export const drawingUtils = {
  drawText: (page: any, text: string, x: number, y: number, font: any, fontSize: number, color: number[]) => {
    const { rgb } = require('pdf-lib');
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(...color)
    });
  },

  drawCenteredText: (page: any, text: string, font: any, fontSize: number, y: number, color: number[]) => {
    const { rgb } = require('pdf-lib');
    const pageSize = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    page.drawText(text, {
      x: (pageSize.width - textWidth) / 2,
      y,
      size: fontSize,
      font,
      color: rgb(...color)
    });
  },

  drawJustifiedText: (page: any, text: string, font: any, fontSize: number, y: number, leftMargin: number, rightMargin: number, color: number[]) => {
    const { rgb } = require('pdf-lib');
    const pageSize = page.getSize();
    const words = text.split(' ');
    const totalTextWidth = words.reduce((total, word) => total + font.widthOfTextAtSize(word, fontSize), 0);
    const spaceWidth = (pageSize.width - leftMargin - rightMargin - totalTextWidth) / (words.length - 1);

    let currentX = leftMargin;
    words.forEach(word => {
      page.drawText(word, {
        x: currentX,
        y,
        size: fontSize,
        font,
        color: rgb(...color)
      });
      currentX += font.widthOfTextAtSize(word, fontSize) + spaceWidth;
    });
  }
};

export const contentGenerators = {
  drawCertificateContent: (page: any, studentData: StudentData, fonts: any) => {
    const { brittanyFont, poppinsFont, bostonAngelFont } = fonts;
    const { CERTIFICATE_POSITIONS, COLORS } = PDF_GENERATOR_CONSTANTS;
    
    const formattedName = textFormatters.formatStudentName(studentData.student);
    drawingUtils.drawCenteredText(page, formattedName, brittanyFont, CERTIFICATE_POSITIONS.STUDENT_NAME.fontSize, CERTIFICATE_POSITIONS.STUDENT_NAME.y, COLORS.BLACK);

    const { passString1, passString2 } = textFormatters.generatePassStrings(studentData.level, studentData.program, studentData.final);
    drawingUtils.drawCenteredText(page, passString1, poppinsFont, CERTIFICATE_POSITIONS.PASS_LINE_1.fontSize, CERTIFICATE_POSITIONS.PASS_LINE_1.y, COLORS.GRAY_35);
    drawingUtils.drawCenteredText(page, passString2, poppinsFont, CERTIFICATE_POSITIONS.PASS_LINE_2.fontSize, CERTIFICATE_POSITIONS.PASS_LINE_2.y, COLORS.GRAY_35);

    const formattedDate = textFormatters.formatDate(studentData.date);
    drawingUtils.drawCenteredText(page, formattedDate, bostonAngelFont, CERTIFICATE_POSITIONS.DATE.fontSize, CERTIFICATE_POSITIONS.DATE.y, COLORS.GRAY_50);
  },

  drawReportHeader: (page: any, studentData: StudentData, font: any) => {
    const { REPORT_POSITIONS, COLORS } = PDF_GENERATOR_CONSTANTS;
    const formattedDate = textFormatters.formatDate(studentData.date);
    const pageSize = page.getSize();
    const dateTextWidth = font.widthOfTextAtSize(formattedDate, REPORT_POSITIONS.DATE.fontSize);
    
    drawingUtils.drawText(page, formattedDate, pageSize.width - dateTextWidth - REPORT_POSITIONS.DATE.x, REPORT_POSITIONS.DATE.y, font, REPORT_POSITIONS.DATE.fontSize, COLORS.BLACK);
  },

  drawReportOverview: (page: any, studentData: StudentData, font: any) => {
    const { REPORT_POSITIONS, COLORS } = PDF_GENERATOR_CONSTANTS;
    const { reportOverviewString1, reportOverviewString2, reportOverviewString3, reportOverviewString4 } = textFormatters.generateReportOverviewStrings(studentData);
    
    drawingUtils.drawJustifiedText(page, reportOverviewString1, font, 11, REPORT_POSITIONS.OVERVIEW_START_Y, REPORT_POSITIONS.LEFT_MARGIN, REPORT_POSITIONS.RIGHT_MARGIN, COLORS.BLACK);
    drawingUtils.drawJustifiedText(page, reportOverviewString2, font, 11, REPORT_POSITIONS.OVERVIEW_START_Y - REPORT_POSITIONS.LINE_HEIGHT, REPORT_POSITIONS.LEFT_MARGIN, REPORT_POSITIONS.RIGHT_MARGIN, COLORS.BLACK);
    drawingUtils.drawJustifiedText(page, reportOverviewString3, font, 11, REPORT_POSITIONS.OVERVIEW_START_Y - REPORT_POSITIONS.LINE_HEIGHT * 2, REPORT_POSITIONS.LEFT_MARGIN, REPORT_POSITIONS.RIGHT_MARGIN, COLORS.BLACK);
    
    drawingUtils.drawText(page, reportOverviewString4, REPORT_POSITIONS.LEFT_MARGIN, REPORT_POSITIONS.OVERVIEW_START_Y - REPORT_POSITIONS.LINE_HEIGHT * 3, font, 11, COLORS.BLACK);
  },

  drawAssignmentsSection: (page: any, studentData: StudentData, font: any) => {
    const { REPORT_POSITIONS, COLORS } = PDF_GENERATOR_CONSTANTS;
    const { ROW_1, ROW_2, TOTAL } = REPORT_POSITIONS.ASSIGNMENTS_SECTION;
    const { NUMBER, CRITERION, LEVEL, SCORE, STATUS, TOTAL: TOTAL_COL } = REPORT_POSITIONS.COLUMNS;
    
    const levelLabel = studentData.shortLevel || studentData.level?.split(' ')[0] || '';

    drawingUtils.drawText(page, '1', NUMBER.x, ROW_1.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, 'ASSIGNMENTS', CRITERION.x, ROW_1.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, levelLabel, LEVEL.x, ROW_1.y, font, 11, COLORS.BLACK);
    
    const assignmentsValue = parseFloat(studentData.assignments) || 0;
    drawingUtils.drawText(page, `${assignmentsValue.toFixed(2)}%`, SCORE.x, ROW_1.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, studentData.assignmentsStatus || STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED, STATUS.x, ROW_1.y, font, 11, COLORS.BLACK);

    drawingUtils.drawText(page, '2', NUMBER.x, ROW_2.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, 'PROGRESS TESTS', CRITERION.x, ROW_2.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, levelLabel, LEVEL.x, ROW_2.y, font, 11, COLORS.BLACK);
    
    const progressTestsValue = parseFloat(studentData.progressTests || '0') || 0;
    drawingUtils.drawText(page, `${progressTestsValue.toFixed(2)}%`, SCORE.x, ROW_2.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, studentData.progressTestsStatus || STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED, STATUS.x, ROW_2.y, font, 11, COLORS.BLACK);

    let totalScore = parseFloat(studentData.assignmentsTotal) || 0;
    
    if (isNaN(totalScore) || !isFinite(totalScore)) {
      totalScore = 0;
    }

    drawingUtils.drawText(page, `${totalScore.toFixed(2)}%`, TOTAL_COL.x, TOTAL.y, font, 11, COLORS.BLACK);
  },

  drawExamSection: (page: any, studentData: StudentData, font: any) => {
    const { EXAM_SECTION, COLUMNS } = PDF_GENERATOR_CONSTANTS.REPORT_POSITIONS;
    const { COLORS, YLE_EXAMS } = PDF_GENERATOR_CONSTANTS;
    const { NUMBER, CRITERION, LEVEL, SCORE, STATUS, TOTAL } = COLUMNS;
    const { START_Y, ROW_HEIGHT } = EXAM_SECTION;

    const examLabel = studentData.exam || '';
    const isYLEExam = YLE_EXAMS.includes(studentData.exam as any);

    if (isYLEExam) {
      drawingUtils.drawText(page, '1', NUMBER.x, START_Y, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING_WRITING_ALT, CRITERION.x, START_Y - 1, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y + 1, font, 10, COLORS.BLACK);
      drawingUtils.drawText(page, `${studentData.readingAndWriting}%`, SCORE.x, START_Y - 1, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.readingAndWritingStatus, STATUS.x, START_Y - 1, font, 11, COLORS.BLACK);

      drawingUtils.drawText(page, '2', NUMBER.x - 2, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.LISTENING, CRITERION.x, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y - ROW_HEIGHT, font, 10, COLORS.BLACK);
      drawingUtils.drawText(page, `${studentData.listeningYLE || studentData.listening}%`, SCORE.x, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.listeningYLEStatus || studentData.listeningStatus, STATUS.x, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);

      drawingUtils.drawText(page, '3', NUMBER.x - 2, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.SPEAKING, CRITERION.x, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y - ROW_HEIGHT * 2, font, 10, COLORS.BLACK);
      drawingUtils.drawText(page, `${studentData.speakingYLE || studentData.speaking}%`, SCORE.x, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.speakingYLEStatus || studentData.speakingStatus, STATUS.x, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);

      const yleTotal = parseFloat(studentData.yleTotal) || 0;
      drawingUtils.drawText(page, `${yleTotal.toFixed(2)}%`, TOTAL.x, START_Y - ROW_HEIGHT * 3 - 15, font, 11, COLORS.BLACK);
    } else {
      drawingUtils.drawText(page, '1', NUMBER.x, START_Y, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING, CRITERION.x, START_Y - 1, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y + 1, font, 10, COLORS.BLACK);
      
      const readingValue = parseFloat(studentData.reading || '0') || 0;
      drawingUtils.drawText(page, `${readingValue.toFixed(2)}%`, SCORE.x, START_Y - 1, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.readingStatus || '', STATUS.x, START_Y - 1, font, 11, COLORS.BLACK);

      drawingUtils.drawText(page, '2', NUMBER.x - 2, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.LISTENING, CRITERION.x, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y - ROW_HEIGHT, font, 10, COLORS.BLACK);
      
      const listeningValue = parseFloat(studentData.listening) || 0;
      drawingUtils.drawText(page, `${listeningValue.toFixed(2)}%`, SCORE.x, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.listeningStatus, STATUS.x, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);

      drawingUtils.drawText(page, '3', NUMBER.x - 2, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.WRITING, CRITERION.x, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y - ROW_HEIGHT * 2, font, 10, COLORS.BLACK);
      
      const writingValue = parseFloat(studentData.writing || '0') || 0;
      drawingUtils.drawText(page, `${writingValue.toFixed(2)}%`, SCORE.x, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.writingStatus || '', STATUS.x, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);

      drawingUtils.drawText(page, '4', NUMBER.x - 2, START_Y - ROW_HEIGHT * 3, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.SPEAKING, CRITERION.x, START_Y - ROW_HEIGHT * 3, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y - ROW_HEIGHT * 3, font, 10, COLORS.BLACK);
      
      const speakingValue = parseFloat(studentData.speaking) || 0;
      drawingUtils.drawText(page, `${speakingValue.toFixed(2)}%`, SCORE.x, START_Y - ROW_HEIGHT * 3, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.speakingStatus, STATUS.x, START_Y - ROW_HEIGHT * 3, font, 11, COLORS.BLACK);

      const generalExamsTotal = parseFloat(studentData.generalExamsTotal) || 0;
      drawingUtils.drawText(page, `${generalExamsTotal.toFixed(2)}%`, TOTAL.x, START_Y - ROW_HEIGHT * 4 + 2, font, 11, COLORS.BLACK);
    }
  },

  drawReportFooter: (page: any, studentData: StudentData, font: any) => {
    const { COLORS } = PDF_GENERATOR_CONSTANTS;
    
    drawingUtils.drawText(page, studentData.gpa, 165, 355, font, 11, COLORS.BLACK);
  }
};

export const generateCertificatePDF = async (studentData: StudentData): Promise<void> => {
  try {
    const { PDFDocument } = await PDFLibLoader.load();

    const existingPdfBytes = await fetch(PDF_GENERATOR_CONSTANTS.API_ENDPOINTS.CERTIFICATE).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const fonts = await pdfUtils.loadFonts(pdfDoc);

    const [firstPage] = pdfDoc.getPages();
    contentGenerators.drawCertificateContent(firstPage, studentData, fonts);

    const backsideLevel = studentData.shortLevel || studentData.level?.split(" ")[0] || "A1.1";
    const backsideFileName = pdfUtils.getBacksideFileName(backsideLevel);
    const backsidePdfBytes = await fetch(`/api/certificate/${backsideFileName} Backside.pdf`).then(res => res.arrayBuffer());
    const backsidePdfDoc = await PDFDocument.load(backsidePdfBytes);
    const [backsidePage] = await pdfDoc.copyPages(backsidePdfDoc, [0]);
    pdfDoc.addPage(backsidePage);

    const pdfBytes = await pdfDoc.save();
    pdfUtils.downloadPDF(pdfBytes, `Certificate ${studentData.student.toUpperCase()}.pdf`);

  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
};

export const generateReportPDF = async (studentData: StudentData): Promise<void> => {
  try {
    const { PDFDocument } = await PDFLibLoader.load();

    const existingPdfBytes = await fetch(PDF_GENERATOR_CONSTANTS.API_ENDPOINTS.REPORT).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const { poppinsFont } = await pdfUtils.loadFonts(pdfDoc);

    const [firstPage] = pdfDoc.getPages();
    
    contentGenerators.drawReportHeader(firstPage, studentData, poppinsFont);
    contentGenerators.drawReportOverview(firstPage, studentData, poppinsFont);
    contentGenerators.drawAssignmentsSection(firstPage, studentData, poppinsFont);
    contentGenerators.drawExamSection(firstPage, studentData, poppinsFont);
    contentGenerators.drawReportFooter(firstPage, studentData, poppinsFont);

    const pdfBytes = await pdfDoc.save();
    pdfUtils.downloadPDF(pdfBytes, `Report ${studentData.student.toUpperCase()}.pdf`);

  } catch (error) {
    console.error('Error generating report PDF:', error);
    throw error;
  }
};

/**
 * Genera los datos reales del estudiante para PDFs usando las funciones de cálculo importadas
 * @param student - Datos del estudiante
 * @param courseData - Datos del curso
 * @param includeCertificateFields - Si incluir campos específicos para certificados
 */
/**
 * Función helper para crear timeout en promesas
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

/**
 * Genera datos de estudiante con manejo mejorado de errores y timeouts
 */
const generateRealStudentData = async (
  student: any, 
  courseData: any, 
  includeCertificateFields = false
): Promise<StudentData> => {
  const studentName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim();
  
  try {
    const [gradesResponse, gradingItemsResponse, gradingPercentageResponse, notesPercentagesResponse] = await withTimeout(
      Promise.all([
        getGradesByCourseAndStudent(courseData.id, student.id),
        getGradingItems(courseData.id),
        getGradingPercentageBySyllabus(courseData.syllabus_id),
        getFinalPercentageBySyllabusId(courseData.syllabus_id)
      ]),
      30000 
    );

    const gradesByStudent = gradesResponse.data;
    const gradingItems = gradingItemsResponse.data;
    const gradingPercentage = gradingPercentageResponse.data;
    const notesPercentages = notesPercentagesResponse.data;

    const gradingGrade = buildGradebookStructure(
      gradingItems,
      [{ id: student.id }],
      gradesByStudent
    );

    const filteredGradingItems = gradingItems.filter(
      (item: any) => !item.item_name.includes('(eliminado)')
    );
    const componentsGradebook = formatGradebookComponents(filteredGradingItems);

    const studentIdString = student.id.toString();
    
    const assignments = calculateAverage(
      gradingGrade,
      componentsGradebook.assignments,
      studentIdString
    );
    const progressTest = calculateAverage(
      gradingGrade,
      componentsGradebook.progressTest,
      studentIdString
    );
    const moversExam = calculateAverage(
      gradingGrade,
      componentsGradebook.moversExam,
      studentIdString
    );
    const assignmentsFormatedData = formatStudentScoreAssignmentsGrades(
      { assignments, progressTest, moversExam },
      courseData?.course_name
    );
    const currentExamType = courseData?.syllabus?.exam_type || 
                           getExamType(courseData?.course_name, courseData?.age_group);

    const examFormatedData = formatStudentScoreExamGrades(
      componentsGradebook.moversExam,
      courseData?.course_name,
      studentIdString,
      gradingGrade,
      notesPercentages,
      currentExamType
    );

    const assignmentAverage = calculateAssignmentAverage(
      {
        assignments: Number(assignments),
        progressTest: Number(progressTest),
      },
      gradingPercentage
    );

    const reportExamAverage = calculateReportExamAverage(
      componentsGradebook.moversExam,
      gradingGrade,
      studentIdString
    );

    const studentAverage = calculateStudentAverage(
      {
        assignments: Number(assignments),
        progressTest: Number(progressTest),
        moversExam: Number(moversExam),
      },
      gradingPercentage
    );

    const gpaResult = calculateFinalGradingStatus(
      notesPercentages,
      studentAverage
    );

    const assignmentScore = assignmentsFormatedData?.[0];
    const progressTestScore = assignmentsFormatedData?.[1];

    const base: StudentData = {
      student: studentName,
      date: new Date().toISOString().split('T')[0],
      program: courseData?.age_group === STUDENT_REPORT_CONSTANTS.AGE_GROUP.ADULT ? 
               STUDENT_REPORT_CONSTANTS.PROGRAMS.GENERAL_ENGLISH : 
               STUDENT_REPORT_CONSTANTS.PROGRAMS.YOUNG_LEARNERS,
      level: courseData?.level?.name || courseData?.course_name || '',
      shortLevel: courseData?.level?.short_name || courseData?.level?.name?.split(" ")[0] || '',
      assignments: assignmentScore?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      assignmentsTotal: assignmentAverage?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      assignmentsStatus: assignmentScore?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      progressTests: progressTestScore?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      progressTestsStatus: progressTestScore?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      exam: currentExamType || STUDENT_REPORT_CONSTANTS.EXAM_TYPES.GENERAL,
      readingAndWriting: STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      readingAndWritingStatus: STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      listening: STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      listeningStatus: STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      speaking: STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      speakingStatus: STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      yleTotal: reportExamAverage || STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      generalExamsTotal: reportExamAverage || STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      gpa: `${studentAverage}% (${gpaResult})`,
      final: gpaResult,
    };

    const finalStudentData = isYLEorKEY(currentExamType)
      ? { ...base, ...pickYLE(examFormatedData) }
      : { ...base, ...pickGeneral(examFormatedData) };

    return finalStudentData;

  } catch (error) {
    console.error(`Error generating data for student ${studentName} (ID: ${student.id}):`, error);
    
    const defaultData: StudentData = {
      student: studentName,
      date: new Date().toISOString().split('T')[0],
      program: courseData?.age_group === 'Adult' ? 'General English' : 'Young Learners',
      level: courseData?.level?.name || courseData?.course_name || '',
      shortLevel: courseData?.level?.short_name || courseData?.level?.name?.split(" ")[0] || '',
      assignments: '0',
      assignmentsTotal: '0',
      assignmentsStatus: 'Not Reported',
      progressTests: '0',
      progressTestsStatus: 'Not Reported',
      exam: 'General',
      readingAndWriting: '0',
      readingAndWritingStatus: 'Not Reported',
      listening: '0',
      listeningStatus: 'Not Reported',
      speaking: '0',
      speakingStatus: 'Not Reported',
      yleTotal: '0',
      generalExamsTotal: '0',
      gpa: '0% (Not Resulted)',
      final: 'Not Resulted',
    };
    
    return defaultData;
  }
};

/**
 * Procesa estudiantes en lotes para certificados
 */
const processStudentsInBatchesForCertificates = async (
  students: any[], 
  courseData: any, 
  courseFolder: any, 
  batchSize: number = 3
): Promise<{ processed: number; errors: number }> => {
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    const batchPromises = batch.map(async (student, index) => {
      const studentName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim();
      try {
        const studentData = await generateRealStudentData(student, courseData, true);
        const pdfBytes = await pdfUtils.generatePDFBytes(studentData, 'certificate');
        
        const fileName = `Certificate_${studentName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        courseFolder?.file(fileName, pdfBytes);
        return { success: true, studentName };
      } catch (studentError) {
        return { success: false, studentName, error: studentError };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    
    let batchProcessed = 0;
    let batchErrors = 0;
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        processed++;
        batchProcessed++;
      } else {
        errors++;
        batchErrors++;
      }
    });
    if (i + batchSize < students.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  return { processed, errors };
};

/**
 * Genera un archivo ZIP con todos los certificados de los estudiantes de los cursos seleccionados
 * @param courseIds - Array de IDs de cursos seleccionados
 */
export const generateBatchCertificatesZIP = async (courseIds: number[]): Promise<void> => {
  if (!Array.isArray(courseIds)) {
    throw new Error(`❌ courseIds is not an array: ${typeof courseIds}`);
  }
  
  if (courseIds.length === 0) {
    throw new Error(`❌ No course IDs provided`);
  }
  
  const invalidIds = courseIds.filter(id => !id || (typeof id !== 'number' && typeof id !== 'string'));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid course IDs: ${invalidIds.join(', ')}`);
  }
  
  try {
    const zip = new JSZip();
    const certificatesFolder = zip.folder("Certificates");
    
    let totalProcessed = 0;
    let totalErrors = 0;
    let coursesProcessed = 0;
    let coursesWithErrors = 0;

    for (let i = 0; i < courseIds.length; i++) {
      const courseId = courseIds[i];
      try {
        const [courseResponse, studentsResponse] = await Promise.all([
          getCourseById(courseId.toString()),
          getCourseWithStudents(courseId.toString())
        ]);
        const courseData = courseResponse.data;
        const studentsData = studentsResponse.data;
        
        const courseFolderName = `${courseData.course_name}_${courseData.course_number}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        const courseFolder = certificatesFolder?.folder(courseFolderName);
        if (!studentsData?.students || studentsData.students.length === 0) {
          coursesProcessed++;
          continue;
        }
        const { processed, errors } = await processStudentsInBatchesForCertificates(
          studentsData.students, 
          courseData, 
          courseFolder
        );

        totalProcessed += processed;
        totalErrors += errors;
        coursesProcessed++;
        
        if (errors > 0) {
          coursesWithErrors++;
        }
      } catch (courseError) {
        coursesWithErrors++;
        try {
          const courseResponse = await getCourseById(courseId.toString());
        } catch (nameError) {
        }
      }
    }
    if (totalProcessed === 0) {
      throw new Error('No certificates were generated successfully. ');
    }
    const zipBytes = await zip.generateAsync({ 
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `Certificates_Batch_${timestamp}_${totalProcessed}certificates.zip`;
    pdfUtils.downloadZIP(zipBytes, fileName);
  } catch (error) {
    console.error('💥 CRITICAL ERROR generating batch certificates ZIP:', error);
    throw error;
  }
};

/**
 * Procesa estudiantes en lotes para evitar sobrecarga del servidor
 */
const processStudentsInBatches = async (
  students: any[], 
  courseData: any, 
  courseFolder: any, 
  batchSize: number = 3
): Promise<{ processed: number; errors: number }> => {
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (student) => {
      try {
        const studentData = await generateRealStudentData(student, courseData, false);
        const pdfBytes = await pdfUtils.generatePDFBytes(studentData, 'report');
        
        const studentName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim();
        const fileName = `Report_${studentName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        courseFolder?.file(fileName, pdfBytes);
        
        return { success: true, studentName };
      } catch (studentError) {
        const studentName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim();
        console.error(`Error generating report for student ${studentName}:`, studentError);
        return { success: false, studentName, error: studentError };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        processed++;
      } else {
        errors++;
      }
    });
    if (i + batchSize < students.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { processed, errors };
};

/**
 * Genera un archivo ZIP con todos los reportes de los estudiantes de los cursos seleccionados
 * @param courseIds - Array de IDs de cursos seleccionados
 */
export const generateBatchReportsZIP = async (courseIds: number[]): Promise<void> => {
  
  try {
    const zip = new JSZip();
    const reportsFolder = zip.folder("Reports");
    
    let totalProcessed = 0;
    let totalErrors = 0;
    let coursesProcessed = 0;
    let coursesWithErrors = 0;

    for (let i = 0; i < courseIds.length; i++) {
      const courseId = courseIds[i];
      try {
        const [courseResponse, studentsResponse] = await Promise.all([
          getCourseById(courseId.toString()),
          getCourseWithStudents(courseId.toString())
        ]);
        
        const courseData = courseResponse.data;
        const studentsData = studentsResponse.data;
        
        const courseFolderName = `${courseData.course_name}_${courseData.course_number}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        const courseFolder = reportsFolder?.folder(courseFolderName);

        if (!studentsData?.students || studentsData.students.length === 0) {
          
          const infoContent = `Course: ${courseData.course_name} (${courseData.course_number})
            Status: No students enrolled
            Date: ${new Date().toISOString().split('T')[0]}
            Note: This course has no students to generate reports for.`;
          
          courseFolder?.file('Course_Info.txt', infoContent);
          coursesProcessed++;
          continue;
        }
        const { processed, errors } = await processStudentsInBatches(
          studentsData.students, 
          courseData, 
          courseFolder
        );

        totalProcessed += processed;
        totalErrors += errors;
        coursesProcessed++;
        
        if (errors > 0) {
          coursesWithErrors++;
        }
      } catch (courseError) {
        coursesWithErrors++;
        console.error(`Error processing course ${courseId}:`, courseError);
        try {
          const courseResponse = await getCourseById(courseId.toString());
          console.error(`Failed course name: ${courseResponse.data?.course_name || 'Unknown'}`);
        } catch (nameError) {
          console.error(`Could not retrieve course name for ID: ${courseId}`);
        }
      }
    }
    if (totalProcessed === 0) {
      throw new Error('No reports were generated successfully. ');
    }

    const zipBytes = await zip.generateAsync({ 
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `Reports_Batch_${timestamp}_${totalProcessed}reports.zip`;
    
    pdfUtils.downloadZIP(zipBytes, fileName);
    

  } catch (error) {
    console.error('Error generating batch reports ZIP:', error);
    throw error;
  }
};
