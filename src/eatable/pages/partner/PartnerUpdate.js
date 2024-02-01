import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './components/PartnerWrite.css';
import { GpsFixed } from '@material-ui/icons';


const PartnerWrite = () => {
    const navigate = useNavigate();

    let { id } = useParams();

    const [post, setPost] = useState({
        storeName: '',
        partnerName: '',
        partnerPhone: '',
        storePhone: '',
        favorite: '',
        lat: '',
        lng: '',
        area: '',
        zipCode: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPost(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    useEffect(() => {

        console.log('=====================================================');
        console.log(post);
        console.log('=====================================================');

    }, [post]);

    const favoriteGroups = [
        ['한식', '중식', '일식'],
        ['이탈리아', '프랑스', '유러피안'],
        ['퓨전', '스페인', '아메리칸'],
        ['스시', '한우', '소고기구이'],
        ['와인', '코스요리', '고기요리'],
        ['한정식', '파스타', '해물'],
        ['다이닝바', '브런치', '카페'],
        ['치킨', '레스토랑', '피자'],
        ['백반', '국수', '비건']
    ];

    useEffect(() => {
        fetch('http://localhost:8080/api/partner/detail/' + id)
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

                    // 여기서 주소 정보를 업데이트합니다.
                    setPost(prevState => ({
                        ...prevState,
                        lat: data.address.lat,
                        lng: data.address.lng,
                        area: data.address.area,
                        zipCode: data.address.zipCode
                    }));
                }
            });
    }, []);

    const postUpdate = (e) => {
        e.preventDefault();

        fetch('http://localhost:8080/api/partner/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(post),
        })
            .then((response) => {
                console.log('response', response);
                if (response.status === 200) {
                    return response.json();
                }
                return null;
            })
            .then((data) => {
                if (data !== null) {
                    navigate(`/partnerdetail/${data.id}`);
                    alert('수정 완료');
                } else {
                    alert('수정 실패');
                }
            });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        let newFavorites = post.favorite.split(',').filter(food => food.trim() !== '');

        if (checked && newFavorites.length >= 3 && !newFavorites.includes(value)) {
            alert('3개 이상은 체크할 수 없습니다.');
            e.target.checked = false;
            return;
        }

        if (checked) {
            newFavorites.push(value);
        } else {
            newFavorites = newFavorites.filter(food => food !== value);
        }

        setPost(prevState => ({
            ...prevState,
            favorite: newFavorites.join(','),
        }));
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_KEY}&libraries=places`;
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            initialize();
        };

        return () => {
            document.body.removeChild(script);
        };



    }, []);

    const handleSetPost = (key, value) => {
        setPost(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const initialize = () => {
        const input = document.getElementById('autocomplete_search');
        const autocomplete = new window.google.maps.places.Autocomplete(input);

        autocomplete.addListener('place_changed', function () {
            const place = autocomplete.getPlace();

            // 장소 없을때---------------------------------------------------
            if (!place.geometry || !place.geometry.location) {
                const service = new window.google.maps.places.AutocompleteService();
                service.getPlacePredictions({ input: input.value }, function (predictions, status) {

                    if (status === 'OK' && predictions) {
                        const placeService = new window.google.maps.places.PlacesService(document.createElement('div'));

                        input.value = predictions[0].description;

                        placeService.getDetails({ placeId: predictions[0].place_id }, function (placeDetails, placeStatus) {
                            if (placeStatus === 'OK') {
                                handleSetPost('lat', placeDetails.geometry.location.lat());
                                handleSetPost('lng', placeDetails.geometry.location.lng());
                                handleSetPost('area', placeDetails.formatted_address);

                                document.getElementById('lat').value = placeDetails.geometry.location.lat();
                                document.getElementById('lng').value = placeDetails.geometry.location.lng();
                                document.getElementById('area').value = placeDetails.formatted_address;

                                for (let i = 0; i < placeDetails.address_components.length; i++) {
                                    const addressType = placeDetails.address_components[i].types[0];
                                    if (addressType === 'postal_code') {
                                        handleSetPost('zipCode', placeDetails.address_components[i].long_name);
                                        document.getElementById('zipCode').value = placeDetails.address_components[i].long_name;
                                        break;
                                    }
                                }
                            } else {
                                alert('근접한 장소의 세부 정보를 가져올 수 없습니다.');
                            }
                        });
                    }
                });
                return;
            }
            // -----------------------------------------------------------

            handleSetPost('lat', place.geometry.location.lat());
            handleSetPost('lng', place.geometry.location.lng());
            handleSetPost('area', place.formatted_address);

            document.getElementById('lat').value = place.geometry.location.lat();
            document.getElementById('lng').value = place.geometry.location.lng();
            document.getElementById('area').value = place.formatted_address;


            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ 'location': place.geometry.location }, function (results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        for (let i = 0; i < results[0].address_components.length; i++) {
                            const addressType = results[0].address_components[i].types[0];
                            if (addressType === 'postal_code') {
                                handleSetPost('zipCode', results[0].address_components[i].long_name);
                                document.getElementById('zipCode').value = results[0].address_components[i].long_name;
                                break;
                            }
                        }
                    } else {
                        alert('우편번호를 찾을 수 없습니다.');
                    }
                } else {
                    alert('Geocoder에 문제가 발생했습니다.');
                }
            });

        });

        input.addEventListener('keydown', function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
            }
        });
    };

    const findMyLocation = (event) => {
        event.preventDefault();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    handleSetPost('lat', latitude);
                    handleSetPost('lng', longitude);

                    document.getElementById('lat').value = latitude;
                    document.getElementById('lng').value = longitude;

                    const geocoder = new window.google.maps.Geocoder();
                    const latLng = new window.google.maps.LatLng(latitude, longitude);
                    geocoder.geocode({ 'location': latLng }, function (results, status) {
                        if (status === 'OK') {
                            if (results[0]) {
                                for (let i = 0; i < results[0].address_components.length; i++) {
                                    const addressType = results[0].address_components[i].types[0];
                                    if (addressType === 'postal_code') {
                                        handleSetPost('zipCode', results[0].address_components[i].long_name);
                                        document.getElementById('zipCode').value = results[0].address_components[i].long_name;
                                        break;
                                    }
                                }

                                handleSetPost('area', results[0].formatted_address);
                                document.getElementById('area').value = results[0].formatted_address;

                                document.getElementById('autocomplete_search').value = results[0].formatted_address;
                            } else {
                                alert('Postal code not found.');
                            }
                        } else {
                            alert('Geocoder failed due to: ' + status);
                        }
                    });
                },
                () => {
                    alert('Unable to retrieve your location.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };


    return (
        <div className="mt-3" id='partnerwrite'>
            <h2 className="display-6">업체 등록</h2>
            <hr />
            <form onSubmit={postUpdate}>
                {/* ID 입력 부분 */}
                <div className="mt-3">
                    <label htmlFor="id">
                        <h5>id</h5>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="id"
                        placeholder=""
                        name="id"
                        value={'id 입력예정'}
                        readOnly
                    />
                </div>

                {/* 나머지 입력 부분들 */}
                {['storeName', 'partnerName', 'partnerPhone', 'storePhone'].map((fieldName, index) => (
                    <div key={index} className="mt-3">
                        <label htmlFor={fieldName}>
                            <h5>{fieldName === 'storeName' ? '매장이름' : fieldName === 'partnerName' ? '관리자이름' : fieldName === 'partnerPhone' ? '관리자 전화번호' : '매장 전화번호'}</h5>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id={fieldName}
                            placeholder={fieldName === 'partnerPhone' ? '전화번호를 입력하세요   ex) 01042364123' : fieldName === 'storePhone' ? '전화번호를 입력하세요   ex) 0242364123' : '이름을 입력하세요'}
                            name={fieldName}
                            onChange={handleChange}
                            value={post[fieldName] || ''} // 값이 정의되지 않았을 때는 빈 문자열을 사용
                        />
                    </div>
                ))}

                {/* 매장주소 입력 부분 */}
                <div className="mt-3">
                    <label htmlFor="address">
                        <h5>매장주소</h5>
                    </label>
                    <div>
                        <div className="act">
                            <input id="autocomplete_search" name="autocomplete_search" type="text" className="form-control" placeholder="Search" />
                            <button onClick={findMyLocation}><GpsFixed /></button>
                        </div>
                        {/* 위도, 경도 입력 */}
                        <input type="text" name="lat" id="lat" placeholder="lat" onChange={handleChange} value={post.lat} />
                        <input type="text" name="lng" id="lng" placeholder="lng" onChange={handleChange} value={post.lng} />
                        {/* 주소와 우편번호 입력 */}
                        <input type="text" name="area" id="area" className="form-control" placeholder="Address" onChange={handleChange} value={post.area} />
                        <input type="text" name="zipCode" id="zipCode" className="form-control" placeholder="zipCode" onChange={handleChange} value={post.zipCode} />
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
                                            onChange={handleCheckboxChange}
                                            checked={post.favorite && post.favorite.includes(food) || ''} // post.favorite가 존재하고, 해당 음식이 선택되었는지 확인
                                        />
                                        <label className="form-check-label" htmlFor={`favorite${index}${i}`}>
                                            {food}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* 권한 선택 부분 */}
                <div className="mt-3">
                    <label htmlFor="job">
                        <h5>권한</h5>
                    </label>
                    <select
                        className={`form-select ${post.job ? 'has-value' : ''}`}
                        name="job"
                        id="job"
                        onChange={handleChange}
                    // value={'post.job'}
                    >
                        <option value="">
                            -- 권한을 선택해 주세요 --
                        </option>
                        <option value="user">유저</option>
                        <option value="user,partner">파트너</option>
                    </select>
                </div>

                {/* 하단 버튼 */}
                <div className="my-3 d-flex">
                    <button type="submit" className="btn btn-outline-dark">
                        수정완료
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-dark ms-1"
                        onClick={() => {
                            navigate(-1);
                        }}
                    >
                        이전으로
                    </button>

                    <Link className="btn btn-outline-dark ms-1" to="/partnerlist">
                        목록
                    </Link>

                </div>
            </form>
            {/* 하단 버튼 */}
        </div >
    );
};

export default PartnerWrite;