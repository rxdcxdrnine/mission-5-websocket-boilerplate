import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { appendLog, selectLogs } from "./chatSlice";
import { io } from "socket.io-client";  // socket on client (frontend)

const useStyles = makeStyles({
  sendButton: {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
  },
  chatCard: {
    width: "100vw",
    minHeight: "100vh",
    maxHeight: "100vh",
  },
  dialogSection: {
    minHeight: "85vh",
    maxHeight: "85vh",
    overflowY: "scroll",
  },
  inputSection: {
    padding: "0 0 0 0",
    minHeight: "15vh",
    maxHeight: "15vh",
  },
});

const socket = io({ path: "/socket" });

export function Chat() {
  const classes = useStyles();
  const logs = useSelector(selectLogs); //useSelector 로 리덕스의 상태값 관리
  const dispatch = useDispatch();
  const [inputMessage, setInputMessage] = useState("");
  const [inputNickname, setNickname] = useState(`${Math.random().toString(36).substr(2,11)}`);
  const handleInputMessageChange = (event) => {
    setInputMessage(event.target.value);
  };
  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  window.onload = () => {
    socket.emit("chat", `${inputNickname} 님이 입장하였습니다.`);
  }

  window.onunload = () => {
    socket.emit("chat", `${inputNickname} 님이 퇴장하였습니다.`);
  }

  useEffect(() => {
    socket.on("chat", (message) => {
      console.log(`${message}`);
      // 컴포넌트 렌더링할 때마다 웹 소켓에서 chat 으로 보낸 메시지를 received 를 달아 dispatch
      // 리덕스의 상태값 중 chat.logs 에 log 추가
      dispatch(appendLog(`${message}`));
    });
  }, [dispatch]);

  return (
    <Card className={classes.chatCard}>
      {/*CardContent -> List items*/}
      <CardContent className={classes.dialogSection}>
        <Grid item xs={12}>
          <List>
            {logs.map((log, index) => (
              <ListItem key={index}>
                <Grid container>
                  <Grid item xs={12}>
                    <ListItemText
                      align={log.includes(`${inputNickname}`) ? "right" : "left"}
                      primary={log}
                    ></ListItemText>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        </Grid>
      </CardContent>

      {/*CardActions -> input*/}
      <CardActions className={classes.inputSection}>
        <Grid container>
          <Grid xs={4}>
            <TextField
                  label="별명"
                  variant="outlined"
                  size="small"
                  value={inputNickname}
                  onChange={handleNicknameChange}
                />
          </Grid>
          <Grid xs={6}>
            <TextField
              label="메시지"
              variant="outlined"
              size="small"
              value={inputMessage}
              onChange={(e) => {
                handleInputMessageChange(e);
                socket.emit("chat", `${inputNickname} 님이 입력하는 중입니다 ...`);
              }}
            />
          </Grid>
          <Grid xs={1}>
            <Button
              className={classes.sendButton}
              variant="contained"
              color="primary"
              size="medium"
              onClick={() => {
                // 클릭할 때마다 입력한 메시지를 sent 를 달아 dispatch
                // 리덕스의 상태값 중 chat.logs 에 log 추가
                dispatch(appendLog(`${inputNickname + ' : ' + inputMessage}`));
                socket.emit("chat", `${inputNickname + ' : ' + inputMessage}`);
                setInputMessage("");
              }}
            >
              전송
            </Button>
          </Grid>
        </Grid>
      </CardActions>

    </Card>
  );
}
