import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import ApvMenu from '../AprovalNav';
import ApvSummitBar from '../ApvSmmitbar';
import ApvSummitLine from '../ApvSummitLine';
import './ApprovalHrm.css';
import '../Approval.css';
import { callApvHrm1API, callApvUpdateAPI } from '../../../apis/ApprovalAPICalls';
import ApvFileList from '../ApvFileList';
import { handleSubmission } from '../ApvSubmit';
import { RESET_APPROVAL } from '../../../modules/ApprovalModule';

function Hrm2({ mode, data }) {

	const dispatch = useDispatch();
	dispatch({ type: RESET_APPROVAL });

	const authes = useSelector(state => state.authes);
	const empNo = authes.empNo;
	console.log("empNo : ", empNo);

	const location = useLocation();
	const initialData = location.state ? location.state.initialData : null;

	const navigate = useNavigate();

	const approval = useSelector(state => state.approval);
	console.log('hrm2 first : ', approval.data);

	const [formData, setFormData] = useState({

		apvNo: approval.apvNo ? approval.apvNo : '',
		title: '기타휴가신청서',
		writeDate: '',
		apvStatus: '결재예정',
		isUrgency: 'F',
		category: '인사',
		empNo: empNo,
		empName: authes.name,
		deptName: authes.dept,
		jobName: authes.job,
		apvLines: approval.apvLines ? approval.apvLines : [],
		apvFiles: approval.apvFiles ? approval.apvFiles : [],
		apvVacations: [{
			startDate: approval.startDate ? approval.startDate : '',
			endDate: approval.endDate ? approval.endDate : '',
			type: approval.type ? approval.type : '',
			comment: approval.comment ? approval.comment : '',
			amount: approval.amount ? approval.amount : 0.0,
			offType1: approval.offType1 ? approval.offType1 : '',
			offType2: approval.offType2 ? approval.offType2 : '',
		}],
	});


	const isEditMode = formData.apvNo ? true : false;
	console.log('isEditMode 1 : ', isEditMode);

	useEffect(() => {
		if (!isEditMode) {
			dispatch({ type: RESET_APPROVAL });
		}
	}, [isEditMode, dispatch]);

	const onSelectDateHandler = (selectedDate, field) => {
		setFormData((prevFormData) => ({
			...prevFormData,
			apvVacations: [{
				...prevFormData.apvVacations[0],
				[field]: selectedDate,
			}],
		}));
	};

	const [dateRange, setDateRange] = useState("");
	const [weekendDays, setWeekendDays] = useState(0);


	useEffect(() => {
		if (formData.apvVacations[0].startDate && formData.apvVacations[0].endDate) {
			const formattedStartDate = new Date(formData.apvVacations[0].startDate).toLocaleDateString();
			const formattedEndDate = new Date(formData.apvVacations[0].endDate).toLocaleDateString();
			setDateRange(`${formattedStartDate} ~ ${formattedEndDate}`);
		}
	}, [formData.apvVacations[0].startDate, formData.apvVacations[0].endDate]);

	useEffect(() => {
		if (formData.apvVacations[0].startDate && formData.apvVacations[0].endDate) {

			console.log('formData.apvVacations[0].startDate && formData.apvVacations[0].endDate');
			let startDate = new Date(formData.apvVacations[0].startDate.split(' ')[0]);
			let endDate = new Date(formData.apvVacations[0].endDate.split(' ')[0]);
			let offType1 = formData.apvVacations[0].offType1;
			let offType2 = formData.apvVacations[0].offType2;


			if (endDate < startDate) {
				alert("종료일자는 시작일자보다 빠를 수 없습니다");
				endDate = startDate;
				offType2 = offType1;
				setFormData((prevFormData) => ({
					...prevFormData,
					apvVacations: [{
						...prevFormData.apvVacations[0],
						endDate: formData.apvVacations[0].startDate.split(' ')[0],
					}],
				}));
			}

			const yearDiff = endDate.getFullYear() - startDate.getFullYear();
			const monthDiff = endDate.getMonth() - startDate.getMonth();
			const dayDiff = endDate.getDate() - startDate.getDate();

			let totalDays = yearDiff * 365 + monthDiff * 30 + dayDiff + 1;
			console.log('totalDays : ', totalDays);

			if (offType1 !== '') {
				totalDays -= 0.5;
			}

			if (offType2 !== '') {
				totalDays -= 0.5;
			}

			totalDays -= weekendDays;

			setFormData((prevFormData) => ({
				...prevFormData,
				apvVacations: [{
					...prevFormData.apvVacations[0],
					amount: totalDays,
				}],
			}));
		}
	}, [formData.apvVacations[0].startDate, formData.apvVacations[0].endDate,
	formData.apvVacations[0].offType1, formData.apvVacations[0].offType2, weekendDays]);

	function countWeekendDays(startDate, endDate) {
		let currentDate = new Date(startDate);
		const endDateObj = new Date(endDate);
		let weekendDays = 0;

		while (currentDate <= endDateObj) {
			const dayOfWeek = currentDate.getDay(); // 0 일요일, 6 토요일
			if (dayOfWeek === 0 || dayOfWeek === 6) {
				weekendDays++;
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return weekendDays;
	}

	useEffect(() => {
		if (formData.apvVacations[0].startDate && formData.apvVacations[0].endDate) {
			const startDate = formData.apvVacations[0].startDate.split(' ')[0];
			const endDate = formData.apvVacations[0].endDate.split(' ')[0];
			const daysBetween = countWeekendDays(startDate, endDate);
			setWeekendDays(daysBetween);
		}
	}, [formData.apvVacations[0].startDate, formData.apvVacations[0].endDate]);
	
	const onChangeHandler = (e) => {
		const { name, value } = e.target;
		if (name === 'offType1') {
			const time = e.target.checked ? value : '';
			setFormData((prevFormData) => ({
				...prevFormData,
				apvVacations: [{
					...prevFormData.apvVacations[0],
					startDate: `${prevFormData.apvVacations[0].startDate.split(' ')[0]} ${time}`,
					offType1: value,
				}],
			}));
		}

		if (name === 'offType2') {
			const time = e.target.checked ? value : '';
			setFormData((prevFormData) => ({
				...prevFormData,
				apvVacations: [{
					...prevFormData.apvVacations[0],
					endDate: `${prevFormData.apvVacations[0].endDate.split(' ')[0]} ${time}`,
					offType2: value,
				}],
			}));
		}
	};

	const onTypeChangeHandler = (e) => {
		const { value } = e.target;
		setFormData((prevFormData) => ({
			...prevFormData,
			apvVacations: [{
				...prevFormData.apvVacations[0],
				type: value,
			}],
		}));
	};

	const onCommentChangeHandler = (e) => {
		const { value } = e.target;
		setFormData((prevFormData) => ({
			...prevFormData,
			apvVacations: [{
				...prevFormData.apvVacations[0],
				comment: value,
			}],
		}));
	};

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
		console.log('Hrm2 - selectedEmployees : ', selectedEmployees);
		if (approval.apvLines) {
			const initialSelectedEmployees = approval.apvLines.map((line, index) => ({
				...line,
				isApproval: 'F',
				apvLineNo: line.apvLineNo,
			}));

			setSelectedEmployees(initialSelectedEmployees);
		}
	}, [approval, setSelectedEmployees]);


	const [refSelectedEmployees, setRefSelectedEmployees] = useState([]);
	const [fileList, setFileList] = useState([]);
	const handleFileUpload = (file) => {
		if (file) {
			// Create a copy of the current apvFiles array and add the new file to it
			const updatedApvFiles = [...formData.apvFiles, file];
			setFormData((prevFormData) => ({
				...prevFormData,
				apvFiles: updatedApvFiles,
			}));

			// Update the fileList state for rendering in the component
			setFileList([...fileList, file]);
			console.log('ApvSummitBar에서 업로드한 파일:', file);
		}
	};

	const updateFileList = (newFileList) => {
		setFileList(newFileList);
	};

	useEffect(() => {
		console.log('fileList : ', fileList);
	}, [fileList])

	const APIPoint = isEditMode ? callApvUpdateAPI : callApvHrm1API;

	const handleSubmissionClick = () => {
		const submissionData = {
			empNo,
			isEditMode,
			formData,
			selectedEmployees,
			refSelectedEmployees,
			navigate,
			fileList,
			APIPoint,
			dispatch,
		};

		console.log('submissionData', submissionData);
		handleSubmission(null, submissionData);
	};
	console.log('formData : ', formData);

	return (
		<section>
			<ApvMenu />
			<div>
				<ApvSummitBar
					onSubmit={handleSubmissionClick}
					updateIsUrgency={updateIsUrgency}
					setSelectedEmployees={setSelectedEmployees}
					setRefSelectedEmployees={setRefSelectedEmployees}
					fileList={fileList}
					updateFileList={updateFileList}
					data={formData}
				/>
				<div className="containerApv">
					<div className="apvApvTitle">기타휴가신청서</div>
					<ApvSummitLine
						mode="create"
						selectedEmployees={selectedEmployees}
						refSelectedEmployees={refSelectedEmployees}
						authes={authes}
						data={formData}
					/>
					<div className="apvContent">
						<div className="apvContentHrm2">
							<div className="column1">휴가 종류</div>
							<select className="input2" name="type" onChange={onTypeChangeHandler}>휴가 종류
								<option>종류</option>
								<option value="경조휴가">경조휴가</option>
								<option value="포상휴가">포상휴가</option>
								<option value="대체휴가">대체휴가</option>
								<option value="기타휴가">기타휴가</option>
							</select>
						</div>
						<div className="apvContentHrm1">
							<div className="column1">시작일자</div>
							<div className="column2">
								<input className="input1" type="date" placeholder="날짜 입력"
									name="startDate"
									value={formData.apvVacations[0].startDate.split(' ')[0]}
									onChange={(e) => onSelectDateHandler(e.target.value, 'startDate')}
								/>
								<label className='labelName'> (반차) </label>
								<label><input type="radio" name="offType1" value="09:00"
								checked={formData.apvVacations[0].offType1 === "09:00"} onChange={onChangeHandler} />오전</label>
								<label><input type="radio" name="offType1" value="14:00"
								checked={formData.apvVacations[0].offType1 === "14:00"} onChange={onChangeHandler} />오후</label>
								<label className='labelName'> - 미선택 시 전일 - </label>
							</div>
						</div>
						<div className="apvContentHrm1">
							<div className="column1">종료일자</div>
							<div className="column2">
								<input className="input1" type="date" placeholder="날짜 입력"
									name="endDate"
									value={formData.apvVacations[0].endDate.split(' ')[0]}
									onChange={(e) => onSelectDateHandler(e.target.value, 'endDate')}
								/>
								<label className='labelName'> (반차) </label>
								<label><input type="radio" name="offType2" value="09:00"
								checked={formData.apvVacations[0].offType2 === "09:00"} onChange={onChangeHandler} />오전</label>
								<label><input type="radio" name="offType2" value="14:00"
								checked={formData.apvVacations[0].offType2 === "14:00"} onChange={onChangeHandler} />오후</label>
								<label className='labelName'> - 미선택 시 전일 - </label>
							</div>
						</div>
						<div className="apvContentHrm1">
							<div className="column1">기간</div>
							<div className="column2">{dateRange}  (주말 {weekendDays}일)</div>
						</div>
						<div className="apvContentDetail">-사유-</div>
						<div className="apvContentDetailComent">
							<textarea placeholder="사유 작성" className='apvTextarea'
								value={formData.apvVacations[0].comment}
								onChange={onCommentChangeHandler}
								onBlur={onCommentChangeHandler}></textarea>
						</div>
					</div>
					<ApvFileList files={fileList} data={formData}/>
				</div>
			</div>
		</section>
	);
}

export default Hrm2;