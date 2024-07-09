/* import { createTheme} from '@mui/material/styles'; */
/* import Header from '../components/headers/Header';
import Sidebar from '../components/Sidebar'; */
import { Outlet, To, useNavigate, Link, useLocation } from "react-router-dom";
import { NavBarUiSecond } from "../components/NarBarUiSecond";
import HomeIcon from "@mui/icons-material/Home";
import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Button, Stack, Badge } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import Popover from "@mui/material/Popover";
//import  { useMemo } from "react";
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
/* import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart"; */
import { AccountCircle, Message } from "@mui/icons-material";
import Logo from "./../assets/logo way2hear 1.png";
import LogoutIcon from "@mui/icons-material/Logout";
import LogoutLogic from "../components/lougout";
import { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import SessionExpiredModal from "../components/modal/components/sessionExpriredModal";
import toast from "react-hot-toast";
import api from "../service/api";
import ContactDialogSup from "../components/modal/ContactModalSup";
import ContactDialog from "../components/modal/ContactModal";
import { mySocketUrl } from "../url";
export type User = {
  token: string;
  user: { marker: string; permissions: []; username: string };
};

interface SidebarProps {
  items: [];

  open: boolean;
}
interface Notification {
  [x: string]: any;
  id: string;
  content: string;
  title: string;
  message: string;
  user: string;
  date: Date;
  notification_id: string;
  contact_id: string;
  to: string;
  read: boolean;
}

const SidebarList = ({ items, open }: SidebarProps) => {
  return (
    <List>
      {items.map(
        (
          item: {
            to: To;
            icon:
              | string
              | number
              | boolean
              | React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | null
              | undefined;
            text:
              | string
              | number
              | boolean
              | React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | null
              | undefined;
          },
          index: React.Key | null | undefined
        ) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <Link to={item.to} style={{ textDecoration: "none", color: "inherit" }}>
              {" "}
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "#ffffff",
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>{" "}
            </Link>
          </ListItem>
        )
      )}
    </List>
  );
};

const DefaultLayout = () => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const storedDataString = localStorage.getItem("auth");
  const storedData = storedDataString ? JSON.parse(storedDataString) : null;
  const [sessionExpired, setSessionExpired] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContactOpen, setModalContactOpen] = useState(false);
  //  console.log(contacts);
  const prevNotificationsCount = useRef(0);
  const [id, setId] = useState("");
  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleContactModalClose = () => {
    setModalContactOpen(false);
  };
  const handleModalOpen = (contactId: string, notificationId: string, to: string) => {
    if (to === "sup") {
      setId(contactId);
      setModalOpen(true);
    } else if (to === "share_for_all") {
      setId(contactId);
      setModalContactOpen(true);
    }
    console.log(contactId);

    deleteNotification(contactId);
    markAsRead(notificationId);
  };

  const handleModificationReussie = () => {
    console.log("ok");
  };

  const username = useMemo(() => storedData?.user?.fullName, [storedData]);

  const socket = io(mySocketUrl);

  const [auth, setAuth] = useState<User | undefined>(() => {
    const user = localStorage.getItem("auth");
    if (!user) return undefined;
    return JSON.parse(user);
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState(null);

  function getUserRole() {
    const userStr = localStorage.getItem("auth");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.user?.roles;
    }
    return undefined;
  }
  const role = getUserRole();
  const contact = role?.includes("superadmin") || role?.includes("formateur") ? "to do" : "Contacts revisés";
  const rapport =
    role?.includes("superadmin") || role?.includes("formateur")
      ? "/way2hear/accueil/quality/proactive_agent/global_result"
      : "/way2hear/accueil/quality/proactive_agent/rapport";

  useEffect(() => {
    //socket.on('connect', () => {
    socket.emit("subscribe", username);
    console.log("connected ....");

    //});
  }, []);

  useEffect(() => {
    api
      .get("/api/notification/get")
      .then((response) => {
        const jsonData = response.data;
        setNotifications(jsonData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    socket.on("notification", (notification) => {
      setNotifications((prevNotifications) => {
        // Vérifier si la notification existe déjà dans le rapport
        const existingNotification = prevNotifications.find(
          (notifications) => notifications._id === notification.data._id
        );

        // Si la notification n'existe pas, l'ajouter au rapport
        if (!existingNotification) {
          return [...prevNotifications, notification.data];
        }
        /// console.log(prevNotifications);

        // Sinon, retourner le rapport inchangé
        return prevNotifications;
      });
    });
  }, [notifications, username]);

  const markAsRead = (notificationId: string) => {
    api
      .post(`/api/notification/update`, {
        notification_id: notificationId,
        read: true,
      })
      .then((response) => {
        const data = response.status;

        if (data === 200) {
          ////toast.success("read");
          console.log("read");
        } else {
          toast.error("error");
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          setSessionExpired(true);
        } else {
          toast.error(error.response ? error.response.data.error : "error");
          console.error("Erreur lors de la requête", error);
        }
      });
    /*   socket.emit("markAsRead", { notificationId, username }); */
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (contactId: string) => {
    console.log(contactId);

    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.contact_id !== contactId)
    );
  };

  useEffect(() => {
    if (notifications.length > prevNotificationsCount.current) {
      toast.success(`${notifications.length - prevNotificationsCount.current} nouveau message(s)`);
    }

    prevNotificationsCount.current = notifications.length;

    console.log(notifications); // Ce console.log reflétera les mises à jour des notifications
  }, [notifications]);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const opens = Boolean(anchorEl);
  const navigate = useNavigate();
  /* setAuth() */
  const { handleLogout } = LogoutLogic();
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const location = useLocation();

  // Définir les éléments de la barre latérale en fonction de l'URL actuelle
  let sidebarItems = [{ text: "Accueil", icon: <HomeIcon />, to: "/way2hear/accueil" }];

  useEffect(() => {
    if (!auth) {
      navigate("/");
    }
  }, [auth]);
  /*   const sidebarItems = [ */
  /* { text: "Accueil", icon: <HomeIcon />, to: "/way2hear/accueil" },
  { text: "Rapport de bord", icon: <DashboardIcon />, to: "/way2hear/accueil/client" },
  { text: "Rapports", icon: <AssignmentIcon />, to: "#" },
  { text: "Campagne", icon: <BarChartIcon />, to: "#" }, */
  /*   { text: "Accueil", icon: <HomeIcon />, to: "/way2hear/accueil" },
  ]; */

  if (location.pathname.includes("/way2hear/accueil/quality/proactive_agent")) {
    sidebarItems = [
      ...sidebarItems,
      { text: "Proactive agent", icon: <SupportAgentIcon />, to: "/way2hear/accueil/quality/proactive_agent" },
      {
        text: "Contact",
        icon: (
          <>
            {" "}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <RecentActorsIcon />
          </>
        ),
        to: "/way2hear/accueil/quality/proactive_agent/contact",
      },
      {
        text: `${contact}`,
        icon: (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <TextSnippetIcon />
          </>
        ),
        to: "/way2hear/accueil/quality/proactive_agent/Contact_revise",
      },
      {
        text: "Rapport",
        icon: (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <PendingActionsIcon />
          </>
        ),
        to: `${rapport}`,
      },
      {
        text: "best_practice",
        icon: (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <SignalCellularAltIcon />
          </>
        ),
        to: "/way2hear/accueil/quality/proactive_agent/best_practice",
      },
    ];
  } else if (location.pathname.includes("/way2hear/accueil/quality/automatic_quality")) {
    sidebarItems = [
      ...sidebarItems,
      { text: "Proactive agent", icon: <SupportAgentIcon />, to: "/way2hear/accueil/quality/automatic_quality" },
      {
        text: "evaluation_agent",
        icon: (
          <>
            {" "}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <HeadsetMicIcon />
          </>
        ),
        to: "/way2hear/accueil/quality/automatic_quality/evaluation_agent",
      },
      {
        text: `Résultats Globaux`,
        icon: (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <TextSnippetIcon />
          </>
        ),
        to: "/way2hear/accueil/quality/automatic_quality/global_result",
      },
      {
        text: "Progression",
        icon: (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <SignalCellularAltIcon />
          </>
        ),
        to: "/way2hear/accueil/quality/automatic_quality/progression",
      },
      {
        text: "Sph",
        icon: (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <UploadFileIcon />
          </>
        ),
        to: "/way2hear/accueil/quality/automatic_quality/sph",
      },
    ];
  }

  const drawerWidth = 240;

  const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,

    backgroundColor: "#130D39",
    color: "#fff",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  });

  const closedMixin = (theme: Theme): CSSObject => ({
    backgroundColor: "#130D39",
    color: "#fff",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
      width: `calc(${theme.spacing(8)} + 1px)`,
    },
  });

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  }));

  interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
  }

  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
  })<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 2,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% )`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    backgroundColor: "#001f3f", // Couleur de fond du Drawer (bleu foncé)
    color: "#fff", // Couleur du texte (blanc)

    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),

      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  }));

  return (
    <>
      <Box
        sx={{
          display: "flex",
          backgroundColor: "#d9d9d9",
          height: "100vh",
          width: "screen",
        }}
      >
        <CssBaseline />

        <AppBar position="fixed" open={open} style={{ backgroundColor: "#f0f0f2", height: 60 }}>
          <Toolbar>
            {/* <img src={Logo} alt="Logo" style={{ height: 40, marginRight: 16 }} loading="lazy" /> */}

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
            <Stack direction="row" spacing={3}>
              {/*             <IconButton size='large' edge='start' aria-label='logo' sx={{
              color: 'black', backgroundColor: 'transparent', '&:focus': {
                outline: 'none',
              },
            }} >
              <Message />
            </IconButton> */}
              <>
                <IconButton
                  size="large"
                  edge="start"
                  aria-label="logo"
                  aria-haspopup="true"
                  onClick={handlePopoverOpen}
                  onMouseLeave={handlePopoverClose}
                  sx={{
                    color: "black",
                    backgroundColor: "transparent",
                    "&:focus": {
                      outline: "none",
                    },
                  }}
                >
                  {/* Afficher une icône de message avec le nombre de notifications non lues */}
                  <Badge badgeContent={notifications.length} color="secondary">
                    <Message />
                  </Badge>
                </IconButton>
              </>

              {notifications.length > 0 && (
                <Popover
                  sx={{
                    marginLeft: "75%",
                    marginTop: "3%",
                    maxHeight: "40%",
                  }}
                  open={opens}
                  // anchorEl={anchorEl}
                  onClose={handlePopoverClose}
                >
                  <List>
                    {notifications.map((notification, index) => (
                      <ListItem key={index}>
                        <ListItemText primary="notification" secondary={notification.message} />
                        {/*  {notification.to === "sup" ? ( */}
                        <Button
                          sx={{
                            color: "primary",
                            "&:focus": {
                              outline: "none",
                            },
                          }}
                          onClick={() =>
                            handleModalOpen(
                              /* ('660546b4e11f4bac989c77ad') */ notification.contact_id,
                              notification._id,
                              notification.to
                            )
                          }
                        >
                          <VisibilityIcon fontSize="small" />
                        </Button>
                        {/* ) : (
                          <span></span>
                        )}  */}
                        {/*  <button onClick={() => deleteNotification(notification._id)}>Supprimer</button> */}
                      </ListItem>
                    ))}
                  </List>
                </Popover>
              )}
              <IconButton
                size="large"
                edge="start"
                aria-label="logo"
                sx={{
                  color: "black",
                  backgroundColor: "transparent",
                  "&:focus": {
                    outline: "none",
                  },
                }}
              >
                <AccountCircle />
              </IconButton>
              <Button
                sx={{
                  color: "black",
                  "&:focus": {
                    outline: "none",
                  },
                }}
              >
                {" "}
                {username}
              </Button>
              <IconButton
                onClick={handleLogout}
                size="large"
                edge="start"
                color="primary"
                aria-label="logo"
                sx={{
                  color: "black",
                  backgroundColor: "transparent",
                  "&:focus": {
                    outline: "none",
                  },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        <Drawer onMouseEnter={handleDrawerOpen} onMouseLeave={handleDrawerClose} variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <SidebarList items={sidebarItems} open={open} />
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            position: "fixed",
            width: "95%",
            marginLeft: "4.5%",
          }}
        >
          <DrawerHeader /> <NavBarUiSecond /> <Divider sx={{ marginBottom: "4rem" }} />
          <SessionExpiredModal
            open={sessionExpired}
            // onReconnect={handleReconnect}
            onClose={() => setSessionExpired(false)}
          />
          <Outlet />
          {/*  <Typography paragraph>
Lorem ipsum dolor sit amet, dummy text....
</Typography>*/}
        </Box>
      </Box>

      {modalOpen && id && (
        <ContactDialogSup
          open={modalOpen}
          onClose={handleModalClose}
          id={id}
          modificationReussie={handleModificationReussie}
        />
      )}

      {modalContactOpen && id && (
        <ContactDialog
          open={modalContactOpen}
          modificationReussie={handleModificationReussie}
          onClose={handleContactModalClose}
          id={id}
        />
      )}

      {/* <div >
      
      <MiniDrawer />
     
      <div className={classes.content}>
        <NavBarUi />

        <NavBarUiSecond />

        <div style={{ backgroundColor: '#d9d9d9', height: '85vh', padding: '30px' }} className=''>
   
          <Outlet />
        </div>
      </div>
    </div> */}
    </>
  );
};

export default DefaultLayout;
