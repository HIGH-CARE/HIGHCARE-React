import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import ApvMenu from '../AprovalNav';
import ApvSummitBar from '../ApvSmmitbar';
import ApvSummitLine from '../ApvSummitLine';
import './ApprovalExp.css';
import '../Approval.css';
import { callApvExp6API } from '../../../apis/ApprovalAPICalls';

function Exp6({ mode, data }) {
	const authes = useSelector(state => state.authes);
	const empNo = authes.empNo;
	console.log("empNo : ", empNo);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const approval = useSelector(state => state.approval);

	const isEditMode = approval.apvLines ? true : false;
	console.log('isEditMode 1 : ', isEditMode);
	console.log('Exp6 first : ', approval.data);

	const [isSendingWreath, setIsSendingWreath] = useState(false);
	const [formCount, setFormCount] = useState(1);
	const [formData, setFormData] = useState({

		apvNo: approval.apvNo?approval.apvNo:'',
		title: '경조금신청서',
		writeDate: '',
		apvStatus: '결재예정',
		isUrgency: 'F',
		category: '지출',
		empNo: empNo,
		empName: authes.name,
		deptName: authes.dept,
		jobName: authes.job,
		apvLines: approval.apvLines ? approval.apvLines : [],
		apvFamilyEvents: [{
			type: approval.type ? approval.type : '',
			familyDate: approval.familyDate ? approval.familyDate : '',
			bank: approval.bank ? approval.bank : '',
			accountHolder: approval.accountHolder ? approval.accountHolder : '',
			accountNumber: approval.accountNumber ? approval.accountNumber : '',
			payment: approval.payment ? approval.payment : 0,
			isSendingWreath: approval.isSendingWreath ? approval.isSendingWreath : 'F',
			sendingName: approval.sendingName ? approval.sendingName : '',
			sendingAddress: approval.sendingAddress ? approval.sendingAddress : '',
			sendingPhone: approval.sendingPhone ? approval.sendingPhone : '',
			requestsNote: approval.requestsNote ? approval.requestsNote : '',
		}]
	});

	const location = useLocation();
	const initialData = location.state ? location.state.initialData : null;

	const onTypeChangeHandler = (e) => {
		const { name, value } = e.target;

		const selectedOption = e.target.options[e.target.selectedIndex];
		const selectedName = selectedOption.getAttribute("name");
		const selectedValue = selectedOption.value;

		const paymentMap = {
			"본인결혼": 5000000,
			"형제자매결혼": 1000000,
			"자녀결혼": 1000000,
			"본인상": 5000000,
			"배우자상": 1000000,
			"자녀상": 1000000,
			"조부모상": 500000,
			"부모상": 1000000,
			"형제자매상": 300000,
			"본인 칠순,팔순,구순": 1000000,
			"조부모 칠순,팔순,구순": 300000,
			"부모 칠순,팔순,구순": 500000,
		};

		setFormData((prevFormData) => ({
			...prevFormData,
			apvFamilyEvents: [{
				...prevFormData.apvFamilyEvents[0],
				[name]: value,
				type: selectedName,
				payment: paymentMap[selectedName] || 0,
			}]
		}));
	}

	const onCheckboxChangeHandler = (e) => {
		const { checked } = e.target;
		setIsSendingWreath(checked);

		setFormData((prevFormData) => ({
			...prevFormData,
			apvFamilyEvents: [{
				...prevFormData.apvFamilyEvents[0],
				payment: checked
					? prevFormData.apvFamilyEvents[0].payment - 150000
					: prevFormData.apvFamilyEvents[0].payment,
				isSendingWreath: checked ? "T" : "F",
			}]
		}));
	};

	const onChangeHandler = (e) => {
		const { name, value } = e.target;
		setFormData((prevFormData) => ({
			...prevFormData,
			apvFamilyEvents: [{
				...prevFormData.apvFamilyEvents[0],
				[name]: value,
			}]
		}));

		console.log('formData : ', formData);
	}

	useEffect(() => {
		const currentDate = new Date();
		setFormData(prevFormData => ({
			...prevFormData,
			writeDate: currentDate,
			...(initialData ? initialData : {}),
		}));
	}, [initialData]);

	const updateIsUrgency = (newIsUrgency) => {
		setFormData(prevFormData => ({
			...prevFormData,
			isUrgency: newIsUrgency
		}));
	};


	const initialSelectedEmployees = [{
		degree: 0,
		isApproval: 'T',
		apvDate: new Date(),
		empNo: authes.empNo,
		empName: authes.name,
		jobName: authes.job,
		deptName: authes.dept,
	}];

	const [selectedEmployees, setSelectedEmployees] = useState(initialSelectedEmployees);

	useEffect(() => {
		console.log('Hrm1 - selectedEmployees : ', selectedEmployees);
		if (approval.apvLines) {
			const initialSelectedEmployees = approval.apvLines.map((line, index) => ({
				...line,
				isApproval: 'F',
				apvLineNo: line.apvLineNo,
			}));

			setSelectedEmployees(initialSelectedEmployees);
		}
	}, [approval, setSelectedEmployees]);



	const handleSubmission = async () => {

		if (empNo !== undefined) {
			try {
				let response;
				if ((isEditMode)) {
					// response = await dispatch(callApvExp6UpdateAPI({ formData, selectedEmployees }));
				} else {

					response = await dispatch(callApvExp6API({ formData, selectedEmployees }));
				}
				if (response.status === 200) {
					if (response.data === "기안 상신 실패") {
						window.alert("결재 등록 실패");
					} else {
						window.alert("결재 등록 성공");
						navigate('/approval');
					}
				} else {
					window.alert("결재 등록 중 오류가 발생했습니다.");
				}
			} catch (error) {
				console.error("API error:", error);
				window.alert("API 요청 중 오류가 발생했습니다.");
			}
		} else {
			window.alert("재로그인 요청");
			navigate('/');
		}
	};

	console.log('formData : ', formData);


	return (

		<section>
			<ApvMenu />
			<div>
				<ApvSummitBar onsubmit={handleSubmission} updateIsUrgency={updateIsUrgency} setSelectedEmployees={setSelectedEmployees} />
				<div className="containerApv">
					<div className="apvApvTitle">경조금신청서</div>
					<ApvSummitLine
						mode="create"
						selectedEmployees={selectedEmployees}
						authes={authes}
						approval={approval}
					/>
					<div className="apvContent">
						<div className="apvContentTitleExp6">
							<div className="column1">경조분류</div>
							<div className="column2">
								<select className="input1" name="type" onChange={onTypeChangeHandler}>
									<option value="">선택</option>
									<optgroup label='결혼'>
										<option name="본인결혼" value="5000000">본인결혼</option>
										<option name="형제자매결혼" value="1000000">형제자매결혼</option>
										<option name="자녀결혼" value="1000000">자녀결혼</option>
									</optgroup>
									<optgroup label='조의'>
										<option name="본인상" value="5000000">본인상</option>
										<option name="배우자상" value="1000000">배우자상</option>
										<option name="자녀상" value="1000000">자녀상</option>
										<option name="조부모상" value="500000">조부모상</option>
										<option name="부모상" value="1000000">부모상</option>
										<option name="형제자매상" value="300000">형제자매상</option>

									</optgroup>
									<optgroup label='기타'>
										<option name="본인 칠순,팔순,구순" value="1000000">본인 칠순,팔순,구순</option>
										<option name="조부모 칠순,팔순,구순" value="300000">조부모 칠순,팔순,구순</option>
										<option name="부모 칠순,팔순,구순" value="500000">부모 칠순,팔순,구순</option>
									</optgroup>
								</select>
							</div>
							<div className="column3">경조일자</div>
							<div className="column4">
								<input className="input1" type="date" placeholder="날짜 입력"
									name="familyDate"
									value={formData.apvFamilyEvents[0].familyDate} onChange={onChangeHandler} />
							</div>
						</div>
						<div className="apvContentTitleExp1-3">
							<div className="column45">지급액</div>
							<div className="column46">{formData.apvFamilyEvents[0].payment} 원</div>

						</div>
						<div className="apvContentTitleExp1-2">
							<div className="column41">예금주</div>
							<div className="column42">
								<input className="input1" placeholder="예금주 입력"
									name='accountHolder' value={formData.apvFamilyEvents[0].accountHolder}
									onChange={onChangeHandler} />
							</div>
							<div className="column43">은행</div>
							<div className="column44">
								<input className="input1" placeholder="계좌번호 입력"
									name='bank' value={formData.apvFamilyEvents[0].bank}
									onChange={onChangeHandler} />
							</div>
						</div>
						<div className="apvContentTitleExp1-3">
							<div className="column45">계좌번호</div>
							<div className="column46">
								<input className="input1" placeholder="계좌번호 입력"
									name='accountNumber' value={formData.apvFamilyEvents[0].accountNumber}
									onChange={onChangeHandler} />
							</div>
						</div>

						<div className="apvContentTitleExp1-4">
							<div className="column45">화환여부 (150,000원 차감)</div>
							<div className="column50">
								<input className="checkbox" type='checkbox' onChange={onCheckboxChangeHandler} />
							</div>
						</div>
						<div className="apvContentDetail3">화환 수령 정보</div>
						<div className="apvContentTitleExp1-2">
							<div className="column41">수령자</div>
							<div className="column42">
								<input className="input1" placeholder="수령자 입력"
									name='sendingName' value={formData.apvFamilyEvents[0].sendingName}
									onChange={onChangeHandler} />
							</div>
							<div className="column43">수령자 연락처</div>
							<div className="column44">
								<input className="input1" placeholder="수령자 연락처 입력"
									name='sendingPhone' value={formData.apvFamilyEvents[0].sendingPhone}
									onChange={onChangeHandler} />
							</div>
						</div>
						<div className="apvContentTitleExp1-3">
							<div className="column45">수령지</div>
							<div className="column46">
								<input className="input1" placeholder="수령지 입력"
									name='sendingAddress' value={formData.apvFamilyEvents[0].sendingAddress}
									onChange={onChangeHandler} />
							</div>
						</div>
						<div className="apvContentTitleExp1-3">
							<div className="column45">요청사항</div>
							<div className="column46">
								<input className="input1" placeholder="요청사항 입력"
									name='requestsNote' value={formData.apvFamilyEvents[0].requestsNote}
									onChange={onChangeHandler} />
							</div>
						</div>
						<div className="apvContentDetail3">위와 같이 지급을 요청합니다.</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Exp6;
