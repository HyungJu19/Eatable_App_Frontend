import React from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import ReviewList from "./ReviewList";

const DetailTab = () => {
  return (
    <div>
      <Container>
        <ReviewList />

        <Tabs defaultActiveKey="storedetail" id="detail-tab">
          <Tab eventKey="storedetail" title="홈">
            홈
          </Tab>
          <Tab eventKey="storemenu" title="메뉴">
            메뉴
          </Tab>
          <Tab eventKey="storeimg" title="사진">
            사진
          </Tab>
          <Tab eventKey="storereview" title="리뷰">
            리뷰
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default DetailTab;