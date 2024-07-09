import React, { useState } from "react";
import CustomAppBar from "../components/CustomAppBBar";
import MySelect from "../components/select/SelectItems";
import MyDateTimePicker from "../components/date/DatePiker";
import { Box, Button, Card, FormControl, Grid, Typography } from "@mui/material";
import ExcelDownloadButton from "../components/dwld";
import toast from "react-hot-toast";
import api from "../service/api";
import SessionExpiredModal from "../components/modal/components/sessionExpriredModal";
import Loader from "../components/Loader";
import MarkerExtractor from "../components/MarkerExtractor";
import MySelectGrid from "../components/select/SelectGrid";
import { useFetchCampaignList, useFetchGridList } from "../components/Parameters";
import DataRapportAgent from "../components/table/TableRapportAgent";
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);
const abbreviateLabel = (label: string) => {
  const words = label.split(" ");
  if (words.length > 1) {
    return words.slice(0, 1).join(" ") + "...";
  }
  return label;
};

function AgentReportRadar({ data }: { data: [any] }) {
  const labels = data.map((item) => item.index);
  const moiData = data.map((item) => parseInt(item.moi));
  const equipeData = data.map((item) => parseInt(item.equipe));
  const meilleurAgentData = data.map((item) => parseInt(item.meilleur_agent));

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Moi",
        data: moiData,
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        fill: true,
      },
      {
        label: "Équipe",
        data: equipeData,
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        fill: true,
      },
      {
        label: "Meilleur Agent",
        data: meilleurAgentData,
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        pointLabels: {
          font: {
            size: 12,
          },
          callback: (value: string) => abbreviateLabel(value),
        },
      },
    },
  };

  return (
    <Box>
      <Radar height={500} width={500} data={chartData} options={options} />
    </Box>
  );
}

export default function RapportAgent() {
  const options = useFetchCampaignList();
  const grids = useFetchGridList();
  const marker = MarkerExtractor();
  const [values, setValues] = React.useState({
    firstDate: undefined,
    lastDate: undefined,
    campaign: "",
    grid: "",
    marker,
  });
  const handleChange = (prop: string) => (value: string | number | Date | undefined) => {
    setValues({ ...values, [prop]: value });
  };
  const [data, setData] = useState([]);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const urlData = "/api/pa/contact/performanceCompare";

  const datas = [
    {
      _id: 1,
      index: "Accroche",
      moi: "10/20",
      equipe: "12/20",
      projet: "13/20",
      best_agent: "11/20",
    },
    {
      _id: 2,
      index: "Decouverte du besoin",
      moi: "10/20",
      equipe: "5/20",
      projet: "13/20",
      best_agent: "17/20",
    },
    {
      _id: 3,
      index: "Proposition",
      moi: "9/20",
      equipe: "12/20",
      projet: "13/20",
      best_agent: "13/20",
    },
    {
      _id: 4,
      index: "Argumentation / Objections",
      moi: "10/20",
      equipe: "11/20",
      projet: "13/20",
      best_agent: "17/20",
    },
    {
      _id: 5,
      index: "Closing",
      moi: "12/20",
      equipe: "12/20",
      projet: "11/20",
      best_agent: "15/20",
    },
  ];
  const limitFistDate = { max: values.lastDate ? values.lastDate : undefined };
  const limitLastDate = { min: values.firstDate ? values.firstDate : undefined };

  const checkFormDetails = () => {
    if (values.firstDate == undefined && values.lastDate == undefined && values.campaign == "" && values.grid == "") {
      return false;
    }
    return true;
  };

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!checkFormDetails()) {
      return toast.error("veuiller remplir au moins un champ");
    }
    setLoading(true);
    //  console.log(values);

    api
      .post(`${urlData}`, values)
      .then((response) => {
        const data = response.data;
        console.log(data);

        if (data.length > 0) {
          setData(data);
          setEmpty(false);
        } else {
          setEmpty(true);

          setData([]);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          setSessionExpired(true);
        } else {
          toast.error(error.response ? error.response.data.error : "error");
          console.error("Erreur lors de la requête", error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderContent = () => {
    if (loading) {
      return <Loader />;
    }

    if (!empty && data.length > 0) {
      return (
        <Card
          sx={{
            height: 600,
            width: "100%",
            backgroundColor: "white",
            padding: "15px",
            display: "flex",
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <DataRapportAgent data={data} />
          </Box>
          <AgentReportRadar data={data} />
        </Card>
      );
    }

    if (empty) {
      return (
        <Card
          sx={{
            height: 500,
            width: "100%",
            backgroundColor: "white",
            padding: "15px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <Typography variant="h6" color="textSecondary" mt={2}>
              Aucune donnée disponible
            </Typography>
          </div>
        </Card>
      );
    }

    return <div></div>;
  };

  return (
    <>
      <CustomAppBar />
      <SessionExpiredModal open={sessionExpired} onClose={() => setSessionExpired(false)} />{" "}
      <div style={{ display: "flex" }}>
        <form
          onSubmit={handleSubmit}
          action=""
          method="post"
          style={{ display: "flex", flexDirection: "row", gap: 55, width: "90%" }}
        >
          <FormControl>
            <MyDateTimePicker
              label="De*"
              value={values.firstDate}
              onChange={handleChange("firstDate")}
              limit={limitFistDate}
            />
          </FormControl>
          <FormControl>
            <MyDateTimePicker
              label="A*"
              value={values.lastDate}
              onChange={handleChange("lastDate")}
              limit={limitLastDate}
            />
          </FormControl>
          <FormControl>
            <MySelect options={options} label="campaign" value={values.campaign} onChange={handleChange("campaign")} />
          </FormControl>
          <FormControl>
            <MySelectGrid grids={grids} label="grille" value={values.grid} onChange={handleChange("grid")} />
          </FormControl>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "10px" }}>
            <Button type="submit" variant="contained">
              Soumettre
            </Button>
            {/* {data.length > 0 && <ExcelDownloadButton data={data} fileName="data.xlsx" />} */}
          </Box>
        </form>
        {/* <Button style={{ float: "right", marginTop: "13px", backgroundColor: "#0FA958", width: '129px', height: '70px', position: 'relative' }} type="submit" variant="contained" >
          magic button
        </Button> */}
      </div>
      <div style={{ marginTop: 15, marginBottom: 12 }}></div>
      {renderContent()}{" "}
    </>
  );
}
