import { createSlice } from "@reduxjs/toolkit";

const memberSlice = createSlice({
    name: 'members',  // 리듀서 이름 
    initialState: {
        id: '',
        password:'',
        empNo:'',
        name: '',
        dept:'',
        job:'',
        isLogin: false,
        role:'',
        status:'',
        
    },
    reducers: {
        loginAction: (state, {payload}) => {       // state는 잡아놓은 초기값의 value를 가져오는 역할 
                                                // actions안에 payload, type 원하는 곳에 넘겨주는 역할 
            console.log("login : ", payload);
            // state.id = payload.id;
            state.empNo = payload.data.empNo;
            state.name = payload.data.memberName; 
            state.dept = payload.data.deptName;
            state.job = payload.data.jobName; 
            state.isLogin = true; 
            state.role =payload.data.role;
            state.status = payload.status;
        },
        logoutAction: (state, {payload}) => {
            state.id = '';
            state.password = '';
            state.empNo = '';
            state.name = '';
            state.dept = '';
            state.job = '';  
            state.isLogin = false; 
            state.role = '';
        },
        reissueAction: (state, {payload}) => {
            console.log("reissueAction : ", state, payload);
            // action.payload에서 가져온 data 
            const {id, empNo, name, dept, job, isLogin, role} = payload.data; 
            // state.id = id;
            // state.empNo = empNo;
            // state.name = name; 
            // state.dept = dept;
            // state.job = job; 
            // state.isLogin = isLogin;
            // state.role = role
        },
        
    },
    extraReducers:{}
})


// 액션 생성자 내보내기 
export const { loginAction, logoutAction, reissueAction } = memberSlice.actions; 
// 리듀서 내보내기 -- store에 저장
export default memberSlice.reducer; 
