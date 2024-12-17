import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme, styled } from "@mui/material/styles";
import RandomQueries from "../../components/IconsHolder/RandomQueries/RandomQueries";
import {
  IconButton,
  Drawer,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Collapse,
  Button,
  Modal,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ScreenSearchDesktop as ScreenSearchDesktopIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import axios from "axios";
import io from "socket.io-client";
import Markdown from "react-markdown";
import cohereimg from "../../assets/Images/images.png";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Tooltip from "@mui/material/Tooltip";
import styles from "./Home.module.css";

const socket1 = io("http://localhost:5000/cohere");

const Homee = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState("");
  const [cohere, setCohere] = useState("");
  const [finalContent, setFinalContent] = useState("");
  const [finalCohere, setFinalCohere] = useState("");
  const [open, setOpen] = useState(false);
  const [answerFlag2, setAnswerFlag2] = useState(true);
  const [isCollapse0, setIsCollapse0] = useState(false);
  const [link, setLink] = useState(false);
  const depthRef = useRef(null);
  const linkref = useRef("");
  const queryRef = useRef("");

  const drawerWidth = 240;
  useEffect(() => {
    socket1.on("response", (data) => {
      if (data.text === "stream ended") {
        setFinalCohere(cohere);
        setAnswerFlag2(true);
        } else {
        setCohere((prevCohere) => (prevCohere || "") + data.text);
        console.log("cohere", cohere);
        setAnswerFlag2(false);
      }
    });

    return () => {
      socket1.off("response");
    };
  }, [cohere]);

  const linksend = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/link_scraper", {
        link: linkref.current.value,
        maxDepth: depthRef.current.value,
        // user: profile.given_name + "_" + profile.family_name,
      });
      console.log(response.data); // Log the response data
      setLink(false);
      alert("Web-scraping Done Successfully!");
    } catch (error) {
      console.error("Error sending link:", error); // Log the error with context
    }
  };


  // useEffect(() => {
  //   if (messages) {
  //     setMessages((prev) => {
  //       let data = [...prev];
  //       if (data.length > 0) {
  //         data[data.length - 1].answer = finalContent;
  //       }
  //       return data;
  //     });
  //   }
  // }, [finalContent]);

  useEffect(() => {
    setMessages((prev) => {
      let data = [...prev];
      if (data.length > 0) {
        data[data.length - 1].answer1 = finalCohere;
      }
      return data;
    });
  }, [finalCohere]);

  useEffect(() => {
    if (answerFlag2) {
      setCohere("");
    }
  }, [answerFlag2]);

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleCollapse0 = () => {
    setIsCollapse0(!isCollapse0);
  };

  const getAnswer = async () => {
    if (searchValue) {
      const userMessage = { answer: searchValue, sender: "user" };
      const botMessage = { sender: "bot", display: 0 };
      
      setTimeout(() => {
        setMessages([...messages, userMessage, botMessage]);
      }, 300);

      setIsOpen(false);
      try {
        await axios.post('http://127.0.0.1:5000/cohere', { text: searchValue });
        setSearchValue("");
      } catch (error) {
        console.log("error in llm call", error);
        setSearchValue("");
      }
    }
  };

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  }));

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, answers]);

  return (
    <>
     <div
  style={{
    height: "100vh",
    width: "100vw",
    backgroundColor: "white",
    padding: 10,
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      height: "10%",
    }}
  >
    <div style={{ width: "2%" }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
        sx={{ mr: 2, ...(open && { display: "none" }) }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <div>
          <div
            style={{
              minHeight: "60px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Tooltip title="Create new chat">
              <OpenInNewIcon
                style={{ color: "#707070" }}
                onClick={() => {
                  setIsOpen(true);
                  setMessages([]);
                }}
              />
            </Tooltip>
            <IconButton
              onClick={() => {
                setOpen(false);
              }}
            >
              {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItem disablePadding sx={{ marginBottom: "8px" }}>
              <ListItemButton
                sx={{
                  "&:hover": {
                    backgroundColor: "#CDF5FD",
                  },
                 
                }}
                onClick={() => {
                  handleCollapse0();
                }}
              >
                <ListItemIcon style={{ minWidth: "20px", marginRight: "8px" }}>
                  <WidgetsOutlinedIcon sx={{ fontSize: 20, color: "#00A9FF" }} />
                </ListItemIcon>
                <ListItemText primary="Custom Data" />
                {isCollapse0 ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>
            <Collapse in={isCollapse0} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4 }}>
                <List>
                  <ListItem disablePadding sx={{ marginBottom: "8px" }}>
                    <ListItemButton
                      sx={{
                        "&:hover": {
                          backgroundColor: "#CDF5FD",
                        }
                      }}
                      onClick={() => setLink(true)}
                    >
                      <ListItemIcon style={{ minWidth: "20px", marginRight: "8px" }}>
                        <ScreenSearchDesktopIcon sx={{ fontSize: 20, color: "#00A9FF" }} />
                      </ListItemIcon>
                      <ListItemText primary="Web Scraping" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Collapse>
          </List>
        </div>
      </Drawer>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "98%",
        justifyContent: "space-between",
      }}
    ></div>
  </div>

  <div
    style={{
      display: "flex",
      flexDirection: "row",
      padding: "10px",
      justifyContent: "space-around",
      height: "78%",
    }}
  >
    {isOpen ? (
      <div
        style={{
          width: "50%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        <RandomQueries onQuerySelect={(query) => setSearchValue(query)} />
      </div>
    ) : (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          padding: "10px",
          height: "100%",
          width: "50%",
        }}
      >
        <div
          ref={messagesEndRef}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
          className={styles.scrollContainer}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <h4>Which response do you prefer?</h4>
            <p style={{ color: "lightgray" }}>
              Your choice will make ChatBot better
            </p>
          </div>
          {messages?.map((message, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: message?.sender === "user" ? "flex-end" : "flex-start",
                flexDirection: message?.sender === "user" ? "row" : "column",
              }}
            >
              {message?.sender === "user" && (
                <p
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "8px",
                    backgroundColor: "#cccccc7d",
                    width: "fit-content",
                  }}
                >
                  {message.answer}
                </p>
              )}
              {message?.sender === "bot" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  {message?.answer1 && (
                    <div
                      className={styles.robotmessageContainer}

                    >
                      <img
                        alt=""
                        src={cohereimg}
                        style={{
                          width: "50px",
                          height: "12px",
                          marginBottom: "12px",
                        }}
                      />
                      <Markdown>{message.answer1}</Markdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {cohere && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <div className={styles.robotmessageContainer}>
                <img
                  alt=""
                  src={cohereimg}
                  style={{
                    width: "50px",
                    height: "12px",
                    marginBottom: "12px",
                  }}
                />
                <Markdown>{cohere}</Markdown>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            height: "7%",
          }}
        >
          <div
            style={{
              width: "50%",
              border: "2px solid #ccc",
              borderRadius: 50,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <input
              ref={queryRef}
              className={styles.searchInput}
              placeholder="Enter the prompt"
              value={searchValue}
              onChange={handleInputChange}
            />
              <Button style={{ color: "black" }} onClick={() => getAnswer()}>
                <SendIcon className={styles.sendIcon} />
              </Button>
          </div>
        </div>
</div>
<Modal
          open={link}
          onClose={() => setLink(false)} // Uncomment and add handleClose function if needed
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "5px",
              maxWidth: "400px",
              margin: "auto",
            }}
          >
            <p style={{ fontSize: "16px", marginBottom: "2px" }}>Webscraping</p>
            <p style={{ fontSize: "12px", color: "gray", marginBottom: "8px" }}>
              Provide the link below
            </p>
            <TextField
              sx={{ width: "90%", marginBottom: "15px" }}
              id="outlined-basic"
              variant="outlined"
              label="Link"
              size="small"
              inputRef={linkref}
            />
            <TextField
              sx={{ width: "90%", marginBottom: "15px" }}
              id="outlined-basic"
              variant="outlined"
              label="Max Depth"
              size="small"
              inputRef={depthRef}
            ></TextField>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "#3B82F6",
                  border: "2px solid",
                  // borderRadius: '20px',
                  width: "100px",
                  height: "40px",
                  padding: "10px",
                }}
                onClick={() => linksend()}
              >
                Submit
              </Button>
            </div>
          </div>
        </Modal>


    </>
     );
};

export default Homee;
