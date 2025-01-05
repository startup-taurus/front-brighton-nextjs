import React from "react";
import Image from "next/image";
import { ImgPath } from "utils/Constant";

type TeacherProfileProps = {
  profileData: {
    profileImage: string;
    firstName: string;
    lastName: string;
    position: string;
    studentQty: number;
    coursesQty: number;
  };
};

const TeacherProfile = ({ profileData }: TeacherProfileProps) => {
  if (!profileData) return null;

  const {
    profileImage,
    firstName,
    lastName,
    position,
    studentQty,
    coursesQty,
  } = profileData;

  return (
    <div className="profile-section my-2">
      <div className="profile-description">
        {profileImage && (
          <Image
            className="profile-image"
            src={`${profileImage}`}
            alt="image profile"
            width={100}
            height={100}
            quality={100}
          />
        )}
        <div>
          <h3 className="teacher-name">
            {firstName} {lastName}
          </h3>
          <p className="teacher-position">{position}</p>
        </div>
      </div>
      <Image
        src={`${ImgPath}/own/hearth-bg.png`}
        className="hearth-decorator"
        alt="image profile"
        width={160}
        height={120}
      />
      <div className="profile-statistics">
        <div className="statistics-item">
          <div className="statistics-icon">
            <Image
              src={`${ImgPath}/own/bag-icon.png`}
              alt="image profile"
              width={70}
              height={70}
            />
          </div>
          <div>
            <h4 className="statistics-qty">{studentQty}</h4>
            <span className="statistics-description">Students</span>
          </div>
        </div>
        <div className="statistics-item">
          <div className="statistics-icon">
            <Image
              src={`${ImgPath}/own/hat-icon.png`}
              alt="image profile"
              width={70}
              height={70}
            />
          </div>
          <div>
            <h4 className="statistics-qty">{coursesQty}</h4>
            <span className="statistics-description">Courses</span>
          </div>
        </div>
      </div>
      <Image
        src={`${ImgPath}/own/yourule-bg.png`}
        className="yourule-decorator"
        alt="image profile"
        width={120}
        height={120}
      />
    </div>
  );
};

export default TeacherProfile;
