import React, { useEffect, useState } from "react";
import { Button, Container, Image, Modal, Spinner } from "react-bootstrap";
import { throttle } from "lodash";
import { Link } from "react-router-dom";
import TopCategoty from "./fregment/TopCategoty";
import StoreLike from "./userreview/StoreLilke";
import PartnerLikeLength from "./userreview/Item/PartnerLikeLength";
import PartnerReviewLength from "./userreview/Item/PartnerReviewLength";

const HomePage = () => {
 
  const [partners, setPartners] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [imageIndex, setImageIndex] = useState(0); // 이미지 인덱스 상태
  const images = [
    "https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1707877698462-111.png",
    "https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1707877700672-222.png",
  ]; // 이미지 URL 배열

  const changeImage = () => {
    setImageIndex((prevIndex) => (prevIndex + 1) % images.length); // 다음 이미지로 인덱스 변경
  };

  console.log(partners);
  useEffect(() => {
    const loadPartners = async () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);

      setTimeout(async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/partner/homeList?page=${page}&size=4`
          );
          if (response.ok) {
            const data = await response.json();
            setPartners((prevPartners) => [
              ...prevPartners,
              ...data.content.filter(
                (partner) => !prevPartners.some((p) => p.id === partner.id)
              ),
            ]);
            setHasMore(data.content.length > 0);
          } else {
            throw new Error("Failed to fetch");
          }
        } catch (error) {
          console.error("Failed to fetch partners", error);
        } finally {
          setIsLoading(false);
        }
      }, 500); // 1초 지연 후 데이터 로딩
    };

    loadPartners();
  }, [page]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
          document.documentElement.offsetHeight &&
        hasMore &&
        !isLoading
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    }, 80); // 100ms 마다 이벤트 핸들러 실행

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, isLoading]);

  // 스크롤 이벤트 핸들링 로직...

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div>
        <div style={{marginTop:"10px"}}>
          <TopCategoty />
        </div>
        {/* 조건부 렌더링으로 GoogleMap  Roulette 컴포넌트 표시 제어 */}
        <hr />
        <h3 className="text-center mb-3">Eatable 근처 맛집</h3>
        <hr />
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="text-center mb-3"
            style={{ width: "100%" }}
          >
            {/* 이미지 섹션 */}
            <div>
              <Link
                to={`/userdetail/${partner.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {/* 매장 사진 */}
                <Image
                  src={
                    partner.fileList[0]
                      ? partner.fileList[0]?.imageUrl
                      : "https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1707717950973-eatabel-1.png"
                  }
                  alt="Partner"
                  style={{
                    width: "450px", // 이미지 크기 조정
                    height: "450px",
                    borderRadius: "5%",
                    objectFit: "cover",
                    marginBottom: "10px",
                  }}
                />
              </Link>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div>
                  <Link
                    to={`/userdetail/${partner.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <h3 style={{ marginRight: "2px" }}>{partner.storeName}</h3>
                    <small style={{ color: "gray" }}>{partner.favorite}</small>
                    {/* 평점 */}
                    <Image
                      src="https://eatablebucket.s3.ap-northeast-2.amazonaws.com/1707877717526-123123.png"
                      alt="Dynamic Image"
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "5%",
                        objectFit: "cover",
                        marginLeft: "10px",
                        marginBottom: "2px",
                      }}
                    />
                    {partner.averageRating ? partner.averageRating : "평가중"}
                  </Link>
                </div>
                <span>
                  <StoreLike partnerId={partner.id} />
                </span>
              </span>
            </div>

            <div
              className="d-flex justify-content align-items-center"
              style={{ marginBottom: "50px" }}
            >
              {/* 조회수 */}
              <span>
                <Image
                  src="https://www.siksinhot.com/static2/images/common/bg_ico_s_click.png"
                  style={{ marginRight: "5px", marginBottom: "2px" }}
                ></Image>
                <span style={{ marginRight: "10px" }}>{partner.viewCnt}</span>
              </span>
              {/* 즐겨찾기 */}
              <span>
                <Image
                  src="https://www.siksinhot.com/static2/images/common/bg_icon_bookmark2.png"
                  style={{
                    width: "13px",
                    marginLeft: "5px",
                    marginRight: "5px",
                    marginBottom: " 2px",
                  }}
                ></Image>
                <PartnerLikeLength partnerId={partner.id} />
              </span>
              <span>
                <Image
                  src="https://www.siksinhot.com/static2/images/common/bg_icon_reviewWrite.png"
                  style={{
                    width: "16px",
                    marginLeft: "15px",
                    marginBottom: "3px",
                    marginRight: "5px",
                  }}
                ></Image>
                <PartnerReviewLength partnerId={partner.id} />
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        )}
        {!isLoading && !hasMore && <p>END</p>}
      </div>
    </Container>
  );
};

export default HomePage;
