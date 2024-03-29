import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Card,
  Col,
  Container,
  ListGroup,
  Row,
  Tab,
  Tabs,
  Image,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { useAuth } from "../../rolecomponents/AuthContext";

// import ReservedPage from "./ReservedPage";

import { Link, useNavigate } from "react-router-dom";
import { Input } from "@material-ui/core";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserWaitingPage from "../userDetails/waiting/userWaitingPage"; // userWaitingPage import 추가
import ReviewPage from "./ReviewPage";
import FollowPage from "./FollowPage";
import { jwtDecode } from "jwt-decode";
import UserReservationPage from "../userDetails/waiting/userReservationPage";

import SignDrop from "./SignDrop";
import ReservedPage from "./ReservedPage";

import BlackToken from "../chenkBlackToken";
import fetchWithToken from "../../rolecomponents/FetchCustom";

// const ResponsiveTabs = styled(Tabs)`
//     @media screen and (max-width: 600px) {
//       font-size:0.5rem; /* 600px 이하일 때 h3 요소의 글자 크기를 줄임 */

//     }
// `;

const StyledContainer = styled(Container)`
  @media screen and (max-width: 600px) {
    font-size: 0.8rem; /* 카드 내부 요소의 글자 크기를 줄임 */
    padding: 10px; /* 카드의 패딩을 조정하여 요소들 사이의 간격을 조절함 */
  }
`;

const UserInfoPage = () => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [temperature, setTemperature] = useState("");
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef();
  const { auth, setAuth, updateProfile, updateToken } = useAuth();
  const [modal, setModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [inputs, setInputs] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showSignOut, setShowSignOut] = useState(false);
  const [message, setMessage] = useState("");

  //////////////////////////////
  const handleSignOutClick = () => {
    setModal(true); // 회원탈퇴 버튼 클릭 시 모달 열기
  };

  const handleCloseSignOutModal = () => {
    setModal(false); // 모달 닫기
  };

  ///////////////////////////////////

  const handleTogglePasswordInput = () => {
    setShowPasswordInput(!showPasswordInput);
  };

  const ToggleSignOut = () => {
    setShowSignOut(!showSignOut);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 가져오기
      if (!token) {
        navigate("/login"); // 토큰이 없다면 로그인 페이지로 리다이렉트
        return;
      }

      try {
        const isBlacklisted = await BlackToken(token); // boolean value expected
        if (isBlacklisted) {
          // Adjusted check based on the expected boolean response
          alert("접근이 거부 되었습니다.");
          localStorage.removeItem("token"); // 토큰 삭제
          navigate("/login"); // 로그인 페이지로 리다이렉트
          setAuth(""); // 프로필 정보 초기화
        }
        // 토큰이 블랙리스트에 없는 경우, 추가적인 동작을 수행할 수 있음
      } catch (error) {
        console.error("토큰 검증 중 오류 발생:", error);
        navigate("/login");
      }
    };

    verifyToken();
  }, [navigate]); // navigate 함수를 의존성 배열에 추가

  useEffect(() => {
    // 사용자 프로필 정보 불러오기
    const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 가져오기
    if (!token) return false; // 토큰이 없다면 false 반환
    const fetchProfile = async () => {
      if (!token) {
        console.error("No token found");
        return;
      }
      try {
        const response = await fetchWithToken(
          "http://localhost:8080/api/user/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            return;
          }
          throw new Error(`Error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);
        setTemperature(data.temperature);
      } catch (error) {
        console.error("Error:", error);
        setError(error.toString());
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputs.newPassword !== inputs.confirmPassword) {
      toast.error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    // API 요청: 비밀번호 변경
    try {
      const token = localStorage.getItem("token"); // 인증 토큰 사용
      const response = await fetch(
        "http://localhost:8080/api/user/change-password",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: profile.username, // 사용자명 동적 할당
            oldPassword: inputs.oldPassword,
            newPassword: inputs.newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("비밀번호 변경 실패");
      }

      setShowSuccessModal(true);
    } catch (error) {
      toast.error("비밀번호 변경에 실패했습니다.");
    }
  };
  const handleLogout = () => {
    setAuth(""); // 프로필 정보도 초기화
    localStorage.removeItem("token");
    // 필요한 경우 localStorage에서 다른 인증 관련 데이터도 제거
    navigate("/login");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    handleLogout();
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  const fieldEdit = (field) => {
    setEdit((state) => ({
      ...state,
      [field]: !state[field],
    }));
  };

  const changeValue = (e, field) => {
    setProfile({
      ...profile,
      [field]: e.target.value,
    });
  };

  const temperColor = (temperature) => {
    if (temperature >= 20) {
      return "https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1708070778358-1.png";
    } else if (temperature >= 10) {
      return "https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1708070780292-2.png";
    } else if (temperature >= 0) {
      return "https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1708070782389-3.png";
    } else if (temperature >= -10) {
      return "https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1708070790881-33.png";
    } else if (temperature >= -20) {
      return "https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1708070787692-22.png";
    } else if (temperature >= -30) {
      return "https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1708070784217-11.png";
    } else {
      return "Gray"; // 기본값은 회색
    }
  };

  // 온도바
  const tempColor = (temperature) => {
    if (temperature >= 20) {
      return "Red";
    } else if (temperature >= 10) {
      return "OrangeRed";
    } else if (temperature >= 0) {
      return "Tomato";
    } else if (temperature >= -10) {
      return "DodgerBlue";
    } else if (temperature >= -20) {
      return "RoyalBlue";
    } else if (temperature >= -30) {
      return "Blue";
    } else if (temperature >= -40) {
      return "MediumBlue";
    } else if (temperature >= -50) {
      return "Navy";
    } else {
      return "Gray"; // 기본값은 회색
    }
  };

  const color = tempColor(parseInt(temperature));

  // 막대의 길이 및 위치 계산
  let barWidth = "0%";
  let barLeft = "50%";

  if (temperature <= 0 && temperature >= -50) {
    barWidth = `${-temperature}%`;
    barLeft = `${50 - -temperature}%`;
  } else if (temperature >= 0 && temperature <= 30) {
    barWidth = `${temperature * 1.8}%`;
    barLeft = "50%";
  }

  console.log("온도는?" + profile.username);

  // 사용자정보 수정
  const handleUpdate = async (field, value) => {
    try {
      const response = await fetch("http://localhost:8080/api/user/update", {
        method: "PUT",

        body: JSON.stringify({
          ...profile,
          [field.name]: auth.profile[field],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }

      const data = await response.json();
      setAuth((data1) => ({
        ...data1,
        profile: data,
      }));
      updateProfile();
      setTemperature(value);
    } catch (error) {
      console.error("Error:", error);
      setError(error);
    }
  };
  console.log("정보수정 됬니?", profile);

  //프로필사진 업데이트

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        setSelectedImage(e.target.result); // 미리보기 이미지 설정
      };

      reader.readAsDataURL(file);
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async () => {
    const formData = new FormData();
    formData.append("file", fileInputRef.current.files[0]);

    try {
      const uploadResponse = await fetch(
        "http://localhost:8080/api/attachments/update-image",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image.");
      }
      const profileData = await uploadResponse.json();

      const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 확인

      if (!token) {
        console.error("No token found");
        return;
      }
      // 서버로부터 반환된 이미지 URL을 이용하여 프로필 업데이트
      setAuth({ isLoggedIn: true, user: profileData, profile: profileData });

      // 업데이트된 프로필 정보를 가져와서 상태 업데이트
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const updateOk = (field) => {
    fieldEdit(field);
    console.log(field.value);
    handleUpdate(field);
  };

  const back = () => {
    navigate(-1);
  };

  const checkPartnerRole = () => {
    const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 가져오기

    if (!token) return false; // 토큰이 없다면 false 반환

    try {
      const decoded = jwtDecode(token); // 토큰 디코딩
      console.log(decoded);
      const roles = decoded.auth ? decoded.auth.split(",") : [];
      console.log(decoded);
      return roles.includes("ROLE_PARTNER"); // ROLE_PARTNER 권한이 있는지 확인
    } catch (error) {
      console.error("토큰 디코딩 중 오류 발생:", error);
      return false;
    }
  };

  // 함수 사용 예시
  if (checkPartnerRole()) {
    console.log("파트너 권한이 있습니다.");
  } else {
    console.log("파트너 권한이 없습니다.");
  }

  const isPartner = () => {
    return checkPartnerRole();
  };

  return (
    <Container style={{ width: "100%", maxWidth: "700px" }}>
      <ToastContainer position="top-center" />
      <Row>
        <Col className="d-flex align-items-center">
          <Card style={{ width: "100%" }} className="mb-2">
            <Card.Body className="align-items-start">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              {isPartner() && (
                <div className="d-flex justify-content-end mb-2">
                  <Link to={"/userpartnerpage"}>
                    <Button style={{ textAlign: "right" }}>매장 관리</Button>
                  </Link>
                </div>
              )}

              <div
                className="d-flex align-items-center"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <span style={{ width: "100%", flex: 1, marginRight: "10px" }}>
                  <Image
                    src={selectedImage || profile.profileImageUrl}
                    alt="Profile"
                    onClick={handleImageClick}
                    style={{
                      borderRadius: "50%",
                      maxWidth: "250px",
                      height: "250px",
                      cursor: "pointer",
                    }}
                  />
                </span>
                <span style={{ width: "100%", flex: 1, marginRight: "10px" }}>
                  <div
                    className={`flex align-items-center ml-3 ${
                      edit.bio ? "input-active" : ""
                    }`}
                  >
                    <span
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        borderBottom: "none",
                      }}
                    >
                      닉네임 : {profile.nickName}
                    </span>
                    <br />
                    <br />내 소개 :{" "}
                    {edit.bio ? (
                      <Input
                        type="text"
                        value={profile.bio}
                        onChange={(e) => changeValue(e, "bio")}
                      />
                    ) : (
                      <span>{profile.bio}</span>
                    )}
                    <Button
                      variant="light"
                      style={{
                        margin: "-5px 0px 0px 10px",
                        padding: "0px 5px",
                      }}
                      onClick={() => fieldEdit("bio")}
                    >
                      {edit.bio ? "취소" : "수정"}
                    </Button>
                    {edit.bio && (
                      <Button
                        variant="light"
                        style={{
                          margin: "-5px 0px 0px 10px",
                          padding: "0px 5px",
                        }}
                        onClick={() => updateOk("bio")}
                      >
                        확인
                      </Button>
                    )}
                    <br />
                    <br />
                    온도 :{" "}
                    <span
                      className="responsive-span"
                      style={{ marginRight: "5px" }}
                    ></span>
                    <br />
                    <div>
                      <span
                        style={{
                          backgroundColor: "white",
                          width: "300px",
                          height: "20px",
                          borderRadius: "10px",
                        }}
                      >
                        <span
                          className="temperature-bar"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "white",
                            border: "1px solid gray",
                            width: "100%",
                            height: "20px",
                            position: "relative",
                            borderRadius: "10px",
                          }}
                        >
                          {/* 막대의 최대 너비를 100%로 설정 */}
                          {/* 온도 바 */}
                          <span
                            style={{
                              backgroundColor: color,
                              width: barWidth,
                              height: "100%",
                              position: "absolute",
                              borderRadius: "10px",
                              left: barLeft,
                            }}
                          ></span>
                          {/* barWidth와 barLeft를 사용하여 막대의 위치와 너비 설정 */}
                          {/* 온도가 0인 경우 가운데 아래에 0 표시 */}
                          <span
                            style={{
                              position: "absolute",
                              left: "100%",
                              bottom: "-20px",
                            }}
                          >
                            30
                          </span>
                          <span
                            style={{
                              position: "absolute",
                              left: "82%",
                              bottom: "-20px",
                            }}
                          >
                            20
                          </span>
                          <span
                            style={{
                              position: "absolute",
                              left: "65%",
                              bottom: "-20px",
                            }}
                          >
                            10
                          </span>
                          <span
                            style={{
                              position: "absolute",
                              left: "50%",
                              bottom: "-20px",
                            }}
                          >
                            0
                          </span>
                          <span
                            style={{
                              position: "absolute",
                              left: "25%",
                              bottom: "-20px",
                            }}
                          >
                            -25
                          </span>
                          <span
                            style={{
                              position: "absolute",
                              left: "0%",
                              bottom: "-20px",
                            }}
                          >
                            -50
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>
                </span>

                <span style={{ width: "100%", flex: 1, marginLeft: "30px" }}>
                  <Image
                    src={temperColor(
                      auth.profile ? auth.profile.temperature : ""
                    )}
                    style={{ width: "80px" }}
                  />
                  {auth.profile ? auth.profile.temperature : ""}
                </span>
              </div>

              <div
                className="d-flex justify-content-end mb-2"
                style={{ marginTop: "-50px" }}
              >
                <Button
                  variant="primary"
                  onClick={handleTogglePasswordInput}
                  style={{ marginRight: "5px" }}
                >
                  비밀번호 변경
                </Button>
                <Button variant="danger" onClick={handleSignOutClick}>
                  회원탈퇴
                </Button>
              </div>

              {/* 회원탈퇴 모달 */}
              <Modal show={modal} onHide={handleCloseSignOutModal}>
                <Modal.Header closeButton>
                  <Modal.Title>회원탈퇴</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <SignDrop />
                  <Button
                    variant="secondary"
                    style={{ marginLeft: "27%", width: "30vh" }}
                    onClick={handleCloseSignOutModal}
                  >
                    닫기
                  </Button>
                </Modal.Body>
              </Modal>

              <div>
                {showPasswordInput ? (
                  <Form onSubmit={handleSubmit}>
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                      <h2>비밀번호 변경</h2>
                    </div>
                    <Form.Group>
                      <Form.Label>현재 비밀번호</Form.Label>
                      <Form.Control
                        type="password"
                        name="oldPassword"
                        required
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>새 비밀번호</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        required
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>새 비밀번호 확인</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        required
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Button variant="primary" onClick={back}>
                      취소
                    </Button>
                    <Button variant="primary" type="submit">
                      변경하기
                    </Button>
                    <p>{message}</p>
                  </Form>
                ) : (
                  <Tabs
                    defaultActiveKey="profile"
                    id="uncontrolled-tab-example"
                  >
                    <Tab eventKey="profile" title="프로필">
                      <ListGroup variant="flush">
                        <ListGroup.Item style={{ border: "none" }}>
                          <div>아이디 : {profile.username}</div>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          닉네임 :{" "}
                          {edit.nickName ? (
                            <Input
                              type="text"
                              value={profile.nickName}
                              onChange={(e) => changeValue(e, "nickName")}
                            />
                          ) : (
                            <span>{profile.nickName}</span>
                          )}
                          <Button
                            variant="light"
                            style={{
                              margin: "-5px 0px 0px 10px",
                              padding: "0px 5px",
                            }}
                            onClick={() => fieldEdit("nickName")}
                          >
                            {edit.nickName ? "취소" : "수정"}
                          </Button>
                          {edit.nickName && (
                            <Button
                              variant="light"
                              style={{
                                margin: "-5px 0px 0px 10px",
                                padding: "0px 5px",
                              }}
                              onClick={() => updateOk("nickName")}
                            >
                              확인
                            </Button>
                          )}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <div>이름 : {profile.name}</div>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          연락처 :{" "}
                          {edit.phone ? (
                            <Input
                              type="text"
                              value={profile.phone}
                              onChange={(e) => changeValue(e, "phone")}
                            />
                          ) : (
                            <span>{profile.phone}</span>
                          )}
                          <Button
                            variant="light"
                            style={{
                              margin: "-5px 0px 0px 10px",
                              padding: "0px 5px",
                            }}
                            onClick={() => fieldEdit("phone")}
                          >
                            {edit.phone ? "취소" : "수정"}
                          </Button>
                          {edit.phone && (
                            <Button
                              variant="light"
                              style={{
                                margin: "-5px 0px 0px 10px",
                                padding: "0px 5px",
                              }}
                              onClick={() => updateOk("phone")}
                            >
                              확인
                            </Button>
                          )}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <div>이메일 : {profile.email}</div>
                        </ListGroup.Item>
                        {/* <Button onClick={updateInfo}>수정</Button> */}
                        {/* <Button onClick={dropOK}>회원탈퇴</Button> */}
                      </ListGroup>
                    </Tab>
                    {/* <Tab eventKey="reserve" title="예약 현황"><UserWaitingPage userId={profile.id}/></Tab>
                    <Tab eventKey="reserved" title="예약 했던곳"><ReservePage/></Tab>
                    <Tab eventKey="review" title="내가 쓴 리뷰"><ReviewPage/></Tab>
                    <Tab eventKey="follow" title="팔로우"><FollowPage/></Tab> */}

                    <Tab eventKey="reserve" title="예약 현황">
                      <ListGroup variant="flush">
                        <ListGroup.Item>예약 현황</ListGroup.Item>
                        <ListGroup.Item>
                          <ListGroup.Item>
                            <UserReservationPage userId={profile.id} />
                          </ListGroup.Item>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <ListGroup.Item>
                            <UserWaitingPage userId={profile.id} />
                          </ListGroup.Item>
                        </ListGroup.Item>
                      </ListGroup>
                    </Tab>
                    <Tab eventKey="reserved" title="예약 했던곳">
                      <ReservedPage userId={profile.id} />
                    </Tab>
                    {/* <Tab eventKey="review" title="내가 쓴 리뷰">
                      <ReviewPage />
                    </Tab>
                    <Tab eventKey="follow" title="팔로우">
                      {FollowPage}
                    </Tab> */}
                  </Tabs>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Modal show={showSuccessModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>비밀번호 변경 성공!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          비밀번호가 성공적으로 변경되었습니다. 다시 로그인 해주세요 .
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            확인
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserInfoPage;
