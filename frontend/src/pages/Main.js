import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"
import "./Main.css"


const socket = io.connect('http://localhost:5000')
function App() {
	const [ me, setMe ] = useState("") // me id 설정
	const [ stream, setStream ] = useState() // setStream update 함수 
	// 상태 변수 사용해서 webRTC stream 객체 저장 및 update
	const [ receivingCall, setReceivingCall ] = useState(false) // 수신 여부
	const [ caller, setCaller ] = useState("") 
	const [ callerSignal, setCallerSignal ] = useState() // 발신자 id는 설정한 signal로
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false) // 호출할 이름
	const [ name, setName ] = useState()
	const myVideo = useRef() // 동영상 태그 사용해 전달될 동영상 참조
	const userVideo = useRef()
	const connectionRef= useRef()

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream) // 웹에서 stream 상태로 전달
			myVideo.current.srcObject = stream // video가 웹캠에서 들어오는 stream으로 전송
		})

	socket.on("me", (id) => {
			setMe(id)
		})

		socket.on("callUser", (data) => { // 호출 사용자 전달 및 데이터 전달
			setReceivingCall(true)
			setCaller(data.from) // data 로 부터 가져옴
			setName(data.name) // 이름 설정
			setCallerSignal(data.signal) // 호출자 신호 설정 ( data.siganl이 됨 )
		})
	}, [])

	const callUser = (id) => { // 실제 사용자 호출 ( id 와 같음 )
		const peer = new Peer({ // simple peer
			initiator: true,
			trickle: false,
			stream: stream // 우리가 원하는 stream 으로 설정
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {

				userVideo.current.srcObject = stream // 비디오 참조 가져옴 ( stream과 같음 )

		})
		// 호출 허용 소켓 추가
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer // 필요 시 연결 취소
	}
	// answerCall 기능
	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}
	// 원할 때 leaveCall 기능
	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
	}

	const onCallOrEnd = () => {
		if (callAccepted && !callEnded) {
			leaveCall()
		} else {
			callUser(idToCall)
		}
	}

	return (
		<div className="container" style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh" }}>

			{/* 메인 비디오 영역 */}
			<div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#1C1E20" }}>
				{/* 메인 비디오 영역 */}
				<div style={{ display: "flex", flexDirection: "column" }} className={callAccepted && !callEnded ? "main-video-area2" : "main-video-area"}>
					{/* 위창 */}
					<div style={{ flex: 1, display: "flex", alignItems: "center" }} className="upper-pane">
						{stream && <video playsInline muted ref={myVideo} autoPlay style={{ flex: 1, marginRight: 5}} className="video-pane"/>}
						{callAccepted && !callEnded ? <video playsInline ref={userVideo} autoPlay style={{ flex: 1, marginLeft: 5 }} className="video-pane" /> : null}
					</div>
				</div>
			</div>

			{/* 하단버튼부 */}
			<div style={{ height: 100, display: "flex", backgroundColor: "#1C1E20" }}>
				<div style={{ width: 300 }} />
				{/* 하단 중앙버튼 */}
				<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
					<div style={{ width: 60, height: 60, backgroundImage: 'url("./img/mic.png")', backgroundSize: "cover", marginLeft: 15, marginRight: 15 }} />
					<div style={{width: 60, height: 60, backgroundImage: 'url("./img/video.png")', backgroundSize: "cover", marginLeft: 15, marginRight: 15,}}/>
					<div style={{width: 60, height: 60, backgroundImage: 'url("./img/share.png")', backgroundSize: "cover", marginLeft: 15, marginRight: 15,}}/>
					<div style={{width: 60, height: 60, backgroundImage: 'url("./img/others.png")', backgroundSize: "cover", marginLeft: 15, marginRight: 15,}}/>
					<div style={{width: 60, height: 60, backgroundImage: 'url("./img/exit.png")', backgroundSize: "cover", marginLeft: 15, marginRight: 15,}} onClick={onCallOrEnd}/>
				</div>
				{/* 하단오른쪽버튼 */}
				<div style={{width: 400, display: "flex", alignItems: "center", justifyContent: "flex-end",}}>
					<div style={{width: 60, height: 60, backgroundImage: 'url("./img/chat.png")', backgroundSize: "cover", marginLeft: 15, marginRight: 15,}}/>
					<div style={{width: 60, height: 60, backgroundImage: 'url("./img/face.png")', backgroundSize: "cover", marginLeft: 15, marginRight: 15,}}/>
				</div>
			</div>

			{/* 전화걸기 입력창 */}
			<div className="myId" style={{position: "absolute", left: 100, bottom: 10, height: 60, width: 500, padding: 5}}>
				<TextField id="filled-basic" label="Name" variant="filled"  style={{width: 150, marginRight: 10}} size="small" value={name} onChange={(e) => setName(e.target.value)} />
				<CopyToClipboard text={me} >
					<Button variant="contained" color="primary" size="small" startIcon={<AssignmentIcon fontSize="small" />}  style={{height: 45}}>
						Copy ID
					</Button>
				</CopyToClipboard>

				<TextField id="filled-basic" label="ID to call" variant="filled"  style={{width: 150, marginLeft: 10, marginRight: 10}} size="small" value={idToCall} onChange={(e) => setIdToCall(e.target.value)}/>
				{/*<div className="call-button">*/}
					{callAccepted && !callEnded ? (
						<Button variant="contained" color="secondary" size="small" onClick={leaveCall} style={{height: 45}}>
							End Call
						</Button>
					) : (
						<IconButton color="primary" aria-label="call" size="small" onClick={() => callUser(idToCall)} style={{height: 45}}>
							<PhoneIcon fontSize="large" />
						</IconButton>
					)}
					{}
				{}
			</div>

			{/* 전화오면 받기버튼 팝업 */}
			<div style={{position: "absolute", bottom: 100, left:0, right:0, marginLeft:"auto", marginRight:"auto"}}>
				{receivingCall && !callAccepted ? (
						<div className="caller">
						<h1 >{name} is calling...</h1>
						<Button variant="contained" color="primary" onClick={answerCall}>
							Answer
						</Button>
					</div>
				) : null}
			</div>
		</div>
	)
}

export default App
