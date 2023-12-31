import { Link, useNavigate } from "react-router-dom";
import MemberListCss from "./MemberList.module.css"
import { TokenVerification } from "../auth/TokenVerification";
import { AuthVarification } from "../auth/AuthVerification";
import { AdminNav } from "../AdminNav";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { allMemberListApi, requestAllMember, selectMember } from "../../../apis/MemberAPICalls";
import MemberModify from "./MemberModify";
import { selectMemberAction } from "../../../modules/memberSlice";


function MemberList() {


    const dispatch = useDispatch();
    const navigate = useNavigate();

    let mem = useSelector(state => state.members);
    const memberList = mem.data;

    // 페이징 변수 
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 20;
    const paging = {
        page: currentPage,
        size: itemsPerPage,
        data: '',
    }

    const totalPages = memberList ? memberList.totalPages : 0;
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber - 1);
    };


    useEffect(() => {

        dispatch(allMemberListApi(paging));

    }, [currentPage])


    const [normalMember, setNormalMember] = useState(0);
    const [preMember, setPreMember] = useState(0);
    const [drawMember, setDrawMember] = useState(0);

    const [inactiveMember, setInactiveMember] = useState(0);

    const [allChecked, setAllChecked] = useState(false); // 전체 선택 체크박스의 상태

    // const [check, setCheck] = useState(false); // 전체 선택 체크박스의 상태
    const [selectedItems, setSelectedItems] = useState([]); // 선택된 체크박스의 값(empNo)을 저장할 배열


    const allCheckbox = () => {

        setAllChecked(!allChecked); // 전체 선택 체크박스의 상태 토글

        if (!allChecked) {
            // 전체 선택 체크박스가 체크되면 모든 아이템을 선택된 아이템 목록에 추가
            const allIds = memberList?.content.map((member) => member.memberId);
            setSelectedItems(allIds);
        } else {
            // 전체 선택 체크박스가 해제되면 모든 아이템을 선택된 아이템 목록에서 제거
            setSelectedItems([]);
        }
    };


    const checkBox = (e) => {
        // setAllChecked()
        const memberId = e.target.value;
        const isChecked = e.target.checked;

        if (allChecked) {
            setAllChecked(false);
            setSelectedItems([memberId]);
        }

        // 선택 상태를 업데이트
        setSelectedItems((prevSelectedItems) => {
            if (isChecked && !prevSelectedItems.includes(memberId)) {
                // 선택 상태를 추가하고 중복을 피하기 위해 체크
                return [...prevSelectedItems, memberId];
            } else if (!isChecked) {
                // 선택 상태를 제거
                return prevSelectedItems.filter((item) => item !== memberId);
            }
            // 선택 상태가 변경되지 않았을 경우 이전 상태를 그대로 반환
            return prevSelectedItems;
        });
        console.log("selectitems : ", selectedItems);
    };


    const [putUserList, setPutUserList] = useState({
        id: '',
        status: 'user',
        method: 'put'
    })



    const memberListRegist = () => {
        console.log("selectItems-----", selectedItems);
        dispatch(requestAllMember(selectedItems));
    }


    useEffect(() => {
        let drawCount = 0;
        let preCount = 0;
        let inactiveCount = 0;

        Array.isArray(memberList?.content) && memberList?.content.forEach((member) => {
            if (member.accessManager) {
                if (member.accessManager.isLock === 'Y') {
                } else if (member.accessManager.isInActive === 'Y') {
                    inactiveCount++;
                } else if (member.accessManager.isExpired === 'Y') {
                } else if (member.accessManager.isWithDraw === 'Y') {
                    drawCount++;
                } else {
                }
            }
            member.roleList.map((role) => {
                if (roleCode(role.authCode) === '임시회원') {
                    preCount++;
                }
            });
        });
        setPreMember(preCount);
        setInactiveMember(inactiveCount);
        setDrawMember(drawCount)
        setNormalMember(memberList?.content.length - preCount - inactiveCount - drawCount);
    }, [memberList]);



    // 멤버선택시 페이지 이동 
    const [clickMember, setClickMember] = useState(null);
    const memberClick = (member) => {
        dispatch(selectMemberAction(member));
        navigate(`/admin/member/modify/${member.empNo}`, { replace: false });

    }

    console.log("--==-=-=-=-=-=-=-=-=-=-=-", memberList);



    return (
        <section>
            <AdminNav />
            <div style={{ marginTop: 20 }}>
                <div className={MemberListCss.title}>회원목록
                    <div>
                        <div>현재 멤버 수: {memberList?.content.length}명 </div>
                        <div>정상: {normalMember}명 / 임시: {preMember}명 / 차단: {inactiveMember}명 / 탈퇴(예정): {drawMember}명 </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: 1200 }} >
                    <div className={MemberListCss.crudBtn}>
                        {/* 임시회원상태만 클릭시 회원등록확정 alert창 띄워지고 권한 일반회원으로 변경됨 */}
                        {/* <button onClick={memberListRegist}>일반회원 전환</button> */}
                    </div>
                    <div className={MemberListCss.excelBtn}>
                        {/* <button>목록다운로드</button>
                        <button>일괄등록</button> */}
                    </div>
                </div>
                <div className={MemberListCss.category}>
                    <input type="checkbox" name="allCheck"
                        checked={allChecked} onChange={allCheckbox} />

                    <div>사원번호</div>
                    <div>이름</div>
                    <div>
                        <select name="jobCode">
                            <option value="null" disabled hidden selected>직급</option>
                            {Array.isArray(memberList?.content) && Array.from(new Set(memberList?.content.map(member => member.employee.jobCode.jobName)))
                                .map(jobName => (
                                    <option key={jobName}>{jobName}</option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <select name="jobCode">
                            <option value="null" disabled hidden selected>부서</option>
                            {Array.isArray(memberList?.content) && Array.from(new Set(memberList?.content.map(member => member.employee.deptCode.deptName)))
                                .map(deptName => (
                                    <option key={deptName}>{deptName}</option>
                                ))}
                        </select>
                    </div>
                    <div>아이디</div>
                    <div>이메일</div>
                    <div>
                        <select name="authCode">
                            <option value="null" disabled hidden selected>
                                유형
                            </option>
                            {Array.isArray(memberList?.content) && Array.from(new Set(memberList?.content.flatMap(member => member.roleList.map(role => roleCode(role.authCode)))))
                                .map(code => (
                                    <option key={code}>{code}</option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <select name="accountStatus">
                            <option value="null" disabled hidden selected>계정상태</option>
                            {Array.isArray(memberList?.content) && Array.from(new Set(memberList?.content.map(member => accountStatus(member.accessManager ? member.accessManager : ''))))
                                .map(code => (
                                    <option key={code}>{code}</option>
                                ))}
                        </select>
                    </div>
                </div>
                {Array.isArray(memberList?.content) && memberList?.content
                    .map(
                        (member) => (
                            <div
                                key={member.empNo} className={MemberListCss.category}

                            >
                                <input type="checkbox" value={member.memberId}
                                    checked={selectedItems.some(memNo => memNo == member.memberId)}
                                    onChange={checkBox} />
                                <div onClick={() => memberClick(member)}>{member.empNo}</div>
                                <div onClick={() => memberClick(member)}>{member.employee.name}</div>
                                <div onClick={() => memberClick(member)}>{member.employee.jobCode.jobName}</div>
                                <div onClick={() => memberClick(member)}>{member.employee.deptCode.deptName}</div>
                                <div onClick={() => memberClick(member)}>{member.memberId ? member.memberId : ''}</div>
                                <div onClick={() => memberClick(member)}>{member.employee.email}</div>
                                <div onClick={() => memberClick(member)}>
                                    {member.roleList.map(role => roleCode(role.authCode ? role.authCode : ''))[0]}
                                </div>
                                <div>
                                    {accountStatus(member.accessManager ? member.accessManager : '')}
                                </div>
                            </div>
                        ))}
                <div className={MemberListCss.paging}>
                    <div style={{ justifyContent: '', marginLeft: '600px', display: 'flex', marginTop: 30 }}>
                        <div className="paging">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <span
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`pagingBtn ${currentPage === index + 1 ? "active" : ""}`}
                                >
                                    {index + 1}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ justifyContent: '', marginLeft: '400px', display: 'flex', alignItems: 'flex-end' }}>
                    <div>
                        <select style={{ marginRight: 10 }}>
                            <option value="nameAndMail" selected>이름+이메일</option>
                            <option value="empno" >사원번호</option>
                        </select>
                    </div>
                    <div>
                        <input type="search"></input>
                        <button style={{ fontSize: 16, width: 70, height: 24 }}>검색</button>
                    </div>
                </div>

            </div>

        </section>

    );
}

export default MemberList;


export const roleCode = (roleCode) => {
    switch (roleCode) {
        case 'ROLE_ADMIN':
            return '관리자';
        case 'ROLE_MANAGER':
            return '매니져';
        case 'ROLE_USER':
            return '일반회원';
        case 'ROLE_PRE_USER':
            return '임시회원'
        case 'ROLE_DRAW_USER':
            return '탈퇴(예정)회원';
        case null:
            return '탈퇴(예정)회원';
        default:
            return '탈퇴(예정)회원';
    }

}

export const accountStatus = (am) => {
    if (am?.isLock == 'Y') {
        return '잠금'
    } else if (am?.isInActive == 'Y') {
        return '차단'
    } else if (am?.isExpired == 'Y') {
        return '만료'
    }
    else if (am?.isWithDraw == 'Y') {
        return '탈퇴'
    } else {
        return '정상';
    }
};

export const accountStatusEng = (am) => {

    if (am?.isLock === 'Y') {
        return 'isLock'
    } else if (am?.isInActive === 'Y') {
        return 'isInActive'
    } else if (am?.isExpired === 'Y') {
        return 'isExpired'
    }
    else if (am?.isWithDraw === 'Y') {
        return 'isWithDraw'
    } else {
        return 'user';
    }
}