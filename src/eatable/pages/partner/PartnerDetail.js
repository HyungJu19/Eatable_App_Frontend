import { Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper"


const PartnerDetail = () => {
  const token = localStorage.getItem("token");
  let isAdmin = false;

  if (token) {
    const decoded = jwtDecode(token);
    const roles = decoded.auth ? decoded.auth.split(",") : [];
    isAdmin = roles.includes("ROLE_ADMIN");
  }

  const navigate = useNavigate();
  let { id } = useParams();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);


  const [post, setPost] = useState({
    storeName: "",
    partnerName: "",
    partnerPhone: "",
    storePhone: "",
    favorite: "",
    lat: "",
    lng: "",
    area: "",
    zipCode: "",
    storeInfo: "",
    tableCnt: "",
    openTime: "",
    reserveInfo: "",
    parking: "",
    corkCharge: "",
    dog: "",
    fileList: [],
    readyTime: "",
  });

  const favoriteGroups = [
    ["한식", "중식", "일식"],
    ["이탈리아", "프랑스", "유러피안"],
    ["퓨전", "스페인", "아메리칸"],
    ["스시", "한우", "소고기구이"],
    ["와인", "코스요리", "고기요리"],
    ["한정식", "파스타", "해물"],
    ["다이닝바", "브런치", "카페"],
    ["치킨", "레스토랑", "피자"],
    ["백반", "국수", "비건"],
  ];
  

  useEffect(() => {
    fetch("http://localhost:8080/api/partner/detail/" + id)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          return null;
        }
      })
      .then((data) => {
        if (data !== null) {
          console.log(data);
          setPost(data);
        }
      });
  }, []);

  const deletePost = () => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    fetch("http://localhost:8080/api/partner/delete/" + id, {
      method: "DELETE",
    })
      .then((response) => response.text())
      .then((data) => {
        if (data === "1") {
          alert("삭제되었습니다");
          navigate("/partnerlist");
        } else {
          alert("삭제 실패");
        }
      });
  };

  const updatePost = () => {
    navigate("/partnerupdate/" + id);
  };

  return (
    <div className="mt-3" id="partnerwrite">
      <h2 className="display-6">매장 관리 - 상세</h2>
      <hr />
      {/* ID 입력 부분 */}
      <div className="mt-3">
        <label htmlFor="id">
          <h5>매장No.{post.id}</h5>
          <h5>파트너No.{post.userId}</h5>
        </label>
      </div>

      {/* 나머지 입력 부분들 */}
      {["storeName", "partnerName", "partnerPhone", "storePhone"].map(
        (fieldName, index) => (
          <div key={index} className="mt-3">
            <label htmlFor={fieldName}>
              <h5>
                {fieldName === "storeName"
                  ? "매장이름"
                  : fieldName === "partnerName"
                    ? "관리자이름"
                    : fieldName === "partnerPhone"
                      ? "관리자 전화번호"
                      : "매장 전화번호"}
              </h5>
            </label>
            <input
              type="text"
              className="form-control"
              id={fieldName}
              placeholder={
                fieldName === "partnerPhone"
                  ? "전화번호를 입력하세요   ex) 01042364123"
                  : fieldName === "storePhone"
                    ? "전화번호를 입력하세요   ex) 0242364123"
                    : "이름을 입력하세요"
              }
              name={fieldName}
              value={post[fieldName] || ""}
              readOnly
            />
          </div>
        )
      )}

      {/* 매장주소 입력 부분 */}
      <div className="mt-3">
        <label htmlFor="address">
          <h5>매장주소</h5>
        </label>
        <div>
          <input
            type="text"
            name="area"
            id="area"
            className="form-control"
            placeholder="Address"
            value={post.address?.area || ""}
            readOnly
          />
          <input
            type="text"
            name="zipCode"
            id="zipCode"
            className="form-control"
            placeholder="zipCode"
            readOnly
            value={post.address?.zipCode || ""}
          />
        </div>
      </div>

      {/* 업종 선택 부분 */}
      <div className="mt-3">
        <label>
          <h5>
            업종 <small>(1개이상 선택)</small>
          </h5>
        </label>
        {favoriteGroups.map((group, index) => (
          <div key={index} className="row">
            {group.map((food, i) => (
              <div key={i} className="col-md-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={food}
                    name="favorite"
                    checked={
                      (post.favorite && post.favorite.includes(food)) || ""
                    }
                    readOnly
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`favorite${index}${i}`}
                  >
                    {food}
                  </label>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 텍스트 입력 */}
      <div className="mt-3">
        <label htmlFor="storeInfo">
          <h5>매장소개</h5>
        </label>
        <textarea
          placeholder="여기에 입력하세요"
          id="storeInfo"
          name="storeInfo"
          value={post.storeInfo}
          readOnly
        ></textarea>
      </div>

      {/* 테이블수 */}
      {/* <span>
        <label htmlFor="tableCnt">
          <h5>예상 소요시간</h5>
        </label>
        <div style={{ display: "flex" }}>
          <input
            type="number"
            className="form-control"
            id="readyTime"
            placeholder="테이블수를 입력하세요"
            name="readyTime"
            min="0"
            value={post.readyTime}
            readOnly
            style={{ width: "100px", maxWidth: "400px" }}
          />
          <span style={{ width: "100%", maxWidth: "400px", marginTop: "9px" }}>
            분
          </span>
        </div>
      </span> */}

      {/* 테이블수 */}
      <div className="mt-3">
        <label htmlFor="tableCnt">
          <h5>테이블수</h5>
        </label>
        <input
          type="number"
          className="form-control"
          id="tableCnt"
          placeholder="테이블수를 입력하세요"
          name="tableCnt"
          min="0"
          value={post.tableCnt}
          readOnly
        />
      </div>

      {/* 영업시간 */}
      <div className="mt-3">
        <label htmlFor="openTime">
          <h5>
            영업시간 <small>(정기휴무)</small>
          </h5>
        </label>
        <input
          type="text"
          className="form-control"
          id="openTime"
          placeholder="영업시간을 입력하세요"
          name="openTime"
          value={post.openTime}
          readOnly
        />
      </div>

      {/* 텍스트 입력 */}
      <div className="mt-3">
        <label htmlFor="reserveInfo">
          <h5>예약주의사항</h5>
        </label>
        <textarea
          placeholder="여기에 입력하세요"
          id="reserveInfo"
          name="reserveInfo"
          value={post.reserveInfo}
          readOnly
        ></textarea>
      </div>

      {/* radio타입 입력 */}
      <div className="mt-3">
        {["parking", "corkCharge", "dog"].map((item, index) => (
          <div key={index} className="form-group">
            <label htmlFor={`${item}Available`}>
              {item === "corkCharge"
                ? "콜키지"
                : item === "dog"
                  ? "애완견"
                  : "주차정보"}
            </label>
            <div className="d-flex">
              <div
                className="form-check"
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  className="form-check-input"
                  type="radio"
                  name={item}
                  id={`${item}Available`}
                  value="TRUE"
                  checked={post[item] === "TRUE"}
                  style={{ marginRight: "5px" }}
                  readOnly
                />
                <label
                  className="form-check-label"
                  htmlFor={`${item}Available`}
                  style={{ marginRight: "10px" }}
                >
                  가능
                </label>
              </div>
              <div
                className="form-check"
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  className="form-check-input"
                  type="radio"
                  name={item}
                  id={`${item}NotAvailable`}
                  value="FALSE"
                  checked={post[item] === "FALSE"}
                  style={{ marginRight: "5px" }}
                  readOnly
                />
                <label
                  className="form-check-label"
                  htmlFor={`${item}NotAvailable`}
                >
                  불가능
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 이미지 파일 표시 */}
      <div className="mt-3">
        <h5>첨부 이미지</h5>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative", // 여기에 추가
              width: "100%",
              height: "100%",
              maxWidth: "700px",
              maxHeight: "400px",
              borderRadius: "15px",
            }}
          >
            <Swiper
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
               
              }}
              pagination={true}
              modules={[EffectCoverflow, Pagination]}
              onSlideChange={(swiper) => setCurrentSlideIndex(swiper.realIndex)}
              autoplay={{ delay: 3000 }}
              style={{ borderRadius: "15px" }}
            >
              {post.fileList &&
                post.fileList.length > 0 &&
                post.fileList.map((file, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={file.imageUrl}
                      alt={`Slide ${index}`}
                      style={{
                        width: "100%",
                        // height: "100%",
                        // maxWidth: "300px",
                        maxHeight: "300px",
                        borderRadius: "15px",
                        objectFit: "cover",
                      }}
                    />
                  </SwiperSlide>
                ))}
            </Swiper>
            <div
              style={{
                position: "absolute",
                right: "10px",
                bottom: "10px",
                backgroundColor: "rgba(140, 240, 240, 0.5)",
                color: "yellow",
                padding: "5px 10px",
                borderRadius: "30px",
                zIndex: 1, // 여기에 추가
              }}
            >
              {currentSlideIndex + 1} / {post.fileList?.length}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 링크 */}
      <div className="d-flex justify-content-end my-3">
        <Button className="button-link" onClick={updatePost}>
          수정
        </Button>
        <div>
          {/* 관리자 권한이 있을 때만 보여줌 */}
          {isAdmin && (
            <>
              <Link className="button-link" to="/partnerlist">
                목록
              </Link>
              <Button
                variant="none"
                className="button-link"
                onClick={deletePost}
              >
                삭제
              </Button>
              <Link className="button-link" to="/partnerwrite">
                작성
              </Link>
            </>
          )}
        </div>
      </div>
      {/* 하단 링크 */}
    </div>
  );
};

export default PartnerDetail;
