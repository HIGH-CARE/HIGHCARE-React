import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios";
import { log } from "loglevel";


// export async function requestMember(empNo, disaptch) {
export const selectMember = createAsyncThunk(
  'select/members',
  async (empNo,) => {
    console.log(empNo);

    try {
      const response = await axios.get(`${process.env.REACT_APP_BASIC_URL}/api/admin/member?empNo=${empNo}`, {
        headers: {
          "Authorization": "Bearer " + window.localStorage.getItem("accessToken"),
        }
      }
      );

      console.log("response", response);
      if (typeof response.data.data === "string")
        alert(response.data.data);

      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
);

export const requestMember = createAsyncThunk(
  'request/members',
  async (form,) => {   // post요청은 url, data, header순 
    console.log('form', form);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASIC_URL}/api/admin/memberjoin`, form,
        {
          headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("accessToken"),
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );

      alert(response.data.data);
      console.log(response.data);

      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
);

export const requestAllMember = createAsyncThunk(
  'requestAll/members',
  async (ids,) => {   // post요청은 url, data, header순 
    console.log('ids', ids);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASIC_URL}/api/admin/allusers`, ids,
        {
          headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("accessToken"),
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );

      alert(response.data.data);
      console.log(response.data);

      // window.location.reload();
      alert(response.data.data);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
);




export const allMemberListApi = createAsyncThunk(
  'all/members',
  async (paging) => {
    console.log("call all Members List API ====== ");
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASIC_URL}/api/admin/memberlist?page=${paging.page}&size=${paging.size}`,
        {
          headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("accessToken"),
          }
        }
      );
      console.log(response.data);

      return response.data.data;
    } catch (error) {
      throw error.response.data;
    }
  }
)


export const ModifyInfoAPI = createAsyncThunk(
  'modify/members',
  async (data) => {
    try {
      let response = await axios.put(`${process.env.REACT_APP_BASIC_URL}/api/admin/member/${data.id}`,
        data,
        {
          headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("accessToken"),
            "Content-Type": "application/json", // JSON 형식으로 보냄
          }
        }
      );

      console.log("응답 : ", response.data);
      alert(response.data.data);

      const result = response.data.data;
      return result;
    } catch (error) {
      throw error.response.data;
    }
  }
);

export const WithDrawInfoAPI = createAsyncThunk(
  'delete/members',
  async (data) => {
    try {
      console.log('data :', data);

      let response = await axios.delete(`${process.env.REACT_APP_BASIC_URL}/api/admin/member/${data.id}`
        , {
          headers: {
            "Authorization": "Bearer " + window.localStorage.getItem("accessToken"),
          }
        }
      )

      console.log("응답 : ", response.data);
      alert(response.data.data);
      const result = response.data.data;
      return result;
    }

    catch (error) {
      throw error.response.data;
    }
  }
)


