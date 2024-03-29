import React, { useState, useEffect } from 'react';
import WaitingCount from '../item/WaitingCount';

const UserReservationPage = ({userId}) => {

    const[userReservations, setUserReservations] = useState([]);

    const fetchUserReservations = async() => {
        try {
            // GET 요청을 보내어 사용자의 예약 정보를 가져옴
            const response = await fetch(`http://localhost:8080/api/reservation/userReservation/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user reservations');
            }
            const data = await response.json();
            setUserReservations(data);
            console.log(JSON.stringify(data) + '데이터입니다데이터');
        } catch (error) {
            console.error('Error fetching user reservations:', error);
        }
    };
    
    useEffect(() => {
        fetchUserReservations();
    }, [userId]); // userId에 대한 의존성이 있다면 배열 안에 추가

    const handleDeleteReservation = async (partnerId, reservationId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/reservation/reservationDelete/${partnerId}/${reservationId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete reservation');
            }
            // 예약 삭제 후 다시 데이터를 불러옴
            fetchUserReservations();
        } catch (error) {
            console.error('Error deleting reservation:', error);
        }
    };

    return (
        <div>
            <h2>나의 대기열</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>이미지</th>
                        <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>순번</th>
                        <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>가게 이름</th>
                        <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>인원</th>
                        <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>예약 일시</th>
                        <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>주소</th>
                        <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>예약 상태</th>
                        <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {userReservations.map(reservation => (
                        <tr key={reservation.id}>
                            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}><img src={reservation.partner.fileList[0].imageUrl} alt="가게 이미지" style={{ width: '100px', height: '100px' }} /></td>
                            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>
                                <WaitingCount partnerId={reservation.partner.id} reservationId={reservation.id} />
                            </td>
                            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{reservation.partner.storeName}</td>
                            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{reservation.people}</td>
                            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{new Date(reservation.reservationRegDate).toLocaleString()}</td>
                            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{reservation.partner.address.area}</td>
                            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>
                            {reservation.reservationState === 'WAITING' ? "입장대기" : 
                            reservation.reservationState === 'TRUE' ?  "입장완료" : 
                            reservation.reservationState === 'FALSE' ?  "입장안함" : ""}
                            </td>
                            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>
                                <button onClick={() => handleDeleteReservation(reservation.partner.id, reservation.id)}>예약 삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserReservationPage;