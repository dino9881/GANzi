import React from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const login = () => {
    // alert("로그인");
    // 서버에 로그인 요청
    // 로그인 성공시 메인페이지로 이동 라우터 이용
    navigate("/");
    // 로그인 실패시 실패메시지 출력
  };

  return (
    <div style={{ backgroundColor: "#27262C", height: "100vh" }}>
      <div className="top-right-circle"></div>
      <div className="left-small-circle"></div>
      <div className="left-big-circle"></div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "531px",
          height: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{ height: "96px", width: "100%", marginTop: "289px" }}
          className="login-title"
        >
          login
        </div>
        <div
          style={{
            height: "46px",
            width: "100%",
            marginTop: "128px",
            display: "flex",
            borderBottom: "2px solid #FFFFFF",
          }}
        >
          <div className="input-label">Username</div>
          <input
            type="text"
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              marginLeft: "20px",
            }}
          />
        </div>
        <div
          style={{
            height: "46px",
            width: "100%",
            marginTop: "54px",
            display: "flex",
            borderBottom: "2px solid #FFFFFF",
          }}
        >
          <div className="input-label">Password</div>
          <input
            type="text"
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              marginLeft: "20px",
            }}
          />
        </div>
        {/* 로그인 버튼 */}
        <div
          style={{ height: "56px", width: "100%", marginTop: "54px" }}
          className="login-btn"
          onClick={login}
        >
          login
        </div>
      </div>
    </div>
  );
}

export default Login;