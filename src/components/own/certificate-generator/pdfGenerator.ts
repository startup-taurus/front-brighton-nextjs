import { PDF_GENERATOR_CONSTANTS, STUDENT_REPORT_CONSTANTS } from '../../../../utils/constants';
import { StudentData } from '../../../../Types/ReportTypes';

// PDF Library singleton
class PDFLibLoader {
  private static instance: any = null;

  static async load() {
    if (!this.instance) {
      this.instance = await import('pdf-lib');
    }
    return this.instance;
  }
}

// Text formatting utilities
export const textFormatters = {
  formatStudentName: (fullName: string): string => {
    const formattedName = fullName.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );

    const names = formattedName.split(' ');

    if (names.length >= 4) {
      names[1] = names[1].charAt(0) + '.';
      names[3] = names[3].charAt(0) + '.';
    } else if (names.length === 3) {
      names[1] = names[1].charAt(0) + '.';
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

// PDF utilities
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
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Drawing utilities
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

// PDF content generators
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

    // Row 1: Assignments
    drawingUtils.drawText(page, '1', NUMBER.x, ROW_1.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, 'ASSIGNMENTS', CRITERION.x, ROW_1.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, levelLabel, LEVEL.x, ROW_1.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, `${studentData.assignments}%`, SCORE.x, ROW_1.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, studentData.assignmentsStatus || STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED, STATUS.x, ROW_1.y, font, 11, COLORS.BLACK);

    // Row 2: Progress Tests
    drawingUtils.drawText(page, '2', NUMBER.x, ROW_2.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, 'PROGRESS TESTS', CRITERION.x, ROW_2.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, levelLabel, LEVEL.x, ROW_2.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, `${studentData.progressTests || STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO_DECIMAL}%`, SCORE.x, ROW_2.y, font, 11, COLORS.BLACK);
    drawingUtils.drawText(page, studentData.progressTestsStatus || STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED, STATUS.x, ROW_2.y, font, 11, COLORS.BLACK);

    // Total calculation
    const assignmentsScore = parseFloat(studentData.assignments) || 0;
    const progressTestsScore = parseFloat(studentData.progressTests || '0') || 0;
    const totalScore = !isNaN(parseFloat(studentData.assignmentsTotal)) 
      ? parseFloat(studentData.assignmentsTotal) 
      : (assignmentsScore + progressTestsScore) / 2;

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
      // YLE Exam format (3 modules)
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

      // YLE Total
      drawingUtils.drawText(page, `${studentData.yleTotal}%`, TOTAL.x, START_Y - ROW_HEIGHT * 3 - 15, font, 11, COLORS.BLACK);
    } else {
      // General Exam format (4 modules)
      drawingUtils.drawText(page, '1', NUMBER.x, START_Y, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING, CRITERION.x, START_Y - 1, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y + 1, font, 10, COLORS.BLACK);
      drawingUtils.drawText(page, `${studentData.reading || STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO}%`, SCORE.x, START_Y - 1, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.readingStatus || '', STATUS.x, START_Y - 1, font, 11, COLORS.BLACK);

      drawingUtils.drawText(page, '2', NUMBER.x - 2, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.LISTENING, CRITERION.x, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y - ROW_HEIGHT, font, 10, COLORS.BLACK);
      drawingUtils.drawText(page, `${studentData.listening}%`, SCORE.x, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.listeningStatus, STATUS.x, START_Y - ROW_HEIGHT, font, 11, COLORS.BLACK);

      drawingUtils.drawText(page, '3', NUMBER.x - 2, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.WRITING, CRITERION.x, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y - ROW_HEIGHT * 2, font, 10, COLORS.BLACK);
      drawingUtils.drawText(page, `${studentData.writing || STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO}%`, SCORE.x, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.writingStatus || '', STATUS.x, START_Y - ROW_HEIGHT * 2, font, 11, COLORS.BLACK);

      drawingUtils.drawText(page, '4', NUMBER.x - 2, START_Y - ROW_HEIGHT * 3, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.SPEAKING, CRITERION.x, START_Y - ROW_HEIGHT * 3, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, examLabel, LEVEL.x, START_Y - ROW_HEIGHT * 3, font, 10, COLORS.BLACK);
      drawingUtils.drawText(page, `${studentData.speaking}%`, SCORE.x, START_Y - ROW_HEIGHT * 3, font, 11, COLORS.BLACK);
      drawingUtils.drawText(page, studentData.speakingStatus, STATUS.x, START_Y - ROW_HEIGHT * 3, font, 11, COLORS.BLACK);

      // General Total
      drawingUtils.drawText(page, `${studentData.generalExamsTotal}%`, TOTAL.x, START_Y - ROW_HEIGHT * 4 + 2, font, 11, COLORS.BLACK);
    }
  },

  drawReportFooter: (page: any, studentData: StudentData, font: any) => {
    const { COLORS } = PDF_GENERATOR_CONSTANTS;
    drawingUtils.drawText(page, `${studentData.gpa}`, 165, 355, font, 11, COLORS.BLACK);
  }
};

// Main PDF generation functions
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