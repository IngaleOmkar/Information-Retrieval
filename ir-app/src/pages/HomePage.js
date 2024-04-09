import { useState, useEffect } from "react";
// import { Button } from "@mui/material";
// import { TextField, MenuItem } from "@mui/material";
// import SearchIcon from '@mui/icons-material/Search';
// import { Typography } from "@mui/material";

import "bootstrap/dist/css/bootstrap.min.css";

import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import axios from 'axios'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import dayjs from 'dayjs';
import Posts from "../components/Posts";
import { PieChart } from 'react-minimal-pie-chart';
import { performQuery } from "../api";

export default function HomePage() {
  const [search, setSearch] = useState(''); //search bar 
  const [data, setData] = useState([]); //holds result of reddit posts
  const [value, setValue] = React.useState([
    dayjs('2024-04-17'),
    dayjs('2024-04-21'),
  ]);
  const [checked, setChecked] = React.useState(true);

  // Create boolean flag for showing advanced search options
  const [showAdvanced, setShowAdvanced] = React.useState(false);


  // Set filter options 
  const [timeFilter, setTimeFilter] = React.useState('Time');

  // Submit filter options
  const [time, setTime] = React.useState('date desc');

  const handleDateToggle = (event) => {
    setChecked(event.target.checked);
  };

  const [documents, setDocuments] = useState([]); //holds result of reddit posts

  const handleSubmit = async (event) => {
    // this function will test if the server is running for now
    // a simple fetch command for: http://127.0.0.1:5000/query?q=tesla
    // log the response 

    // prevent the page from refreshing
    event.preventDefault();

    //fetch the data from the servers
    const inputData = {
      "query" : search, 
      "start" : "",
      "end" : "",
      "sort_type" : ""
    }
    const response = await axios.post("http://127.0.0.1:5000/get_query", 
      {
          Headers: {
              'Content-Type': 'application/json'
          },
          ...inputData
      })

      //console.log("Response: ", response.data)
      console.log(response.data.results.documents)
      if(response.status === 200){
        setDocuments(response.data.results.documents)

      }
      else{
        console.error("Error from backend: ", response.data.error)
      }
    // const response = await fetch('http://127.0.0.1:5000/query?q=' + search);

    // //convert the response to json
    // const data = await response.json();

    // const data_json = JSON.parse(data);

    // setDocuments(data_json['documents']);
  }

  const toggleAdvancedSearchOptions = () => { setShowAdvanced(!showAdvanced) };
  
  const handleSearch = async (type) => {
    // type can be either "query" or "vote"
    let inputData= {}
    if(type === "query"){
      inputData = {
        query:  "recession", //search,
        start: "2024-02-01",  //value[0].format('YYYY-MM-DD'),
        end:  "2024-02-14",//value[1].format('YYYY-MM-DD'),
        sort_type: "reddit_score asc"
      }
    }
    else{ 
      inputData = {
        query:  "recession", //search,
        start: "2024-02-01",  //value[0].format('YYYY-MM-DD'),
        end:  "2024-02-14",//value[1].format('YYYY-MM-DD'),
        sort_type: "reddit_score asc",
        doc_id: "1akg3bc",
        vote_type: "down"
      }
    }
    const results = await performQuery(inputData, type)
    console.log(results)
  }

  const advancedSearchOptions = () => {
    return (
      <div className="d-flex align-items-center">
        <DropdownButton
          id="time"
          variant="outline-light"
          menuVariant="dark"
          title={timeFilter}
          className="mt-2"
          style={{ marginLeft: '15px' }}>
          <Dropdown.Item onClick={() => { setTimeFilter("Time") }} >
            Time
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => { setTimeFilter("Most recent"); setTime('date desc') }}>Most recent</Dropdown.Item>
          <Dropdown.Item onClick={() => { setTimeFilter("Least recent"); setTime('date asc') }}>Least recent</Dropdown.Item>
        </DropdownButton>
        <DropdownButton
          id="time"
          variant="outline-light"
          menuVariant="dark"
          title={timeFilter}
          className="mt-2"
          style={{ marginLeft: '15px' }}>
          <Dropdown.Item onClick={() => { setTimeFilter("Time") }} >
            Time
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => { setTimeFilter("Most recent"); setTime('date desc') }}>Most recent</Dropdown.Item>
          <Dropdown.Item onClick={() => { setTimeFilter("Least recent"); setTime('date asc') }}>Least recent</Dropdown.Item>
        </DropdownButton>
      </div>
    );
  }

  return (
    <div id="Page" className="Page" style={{ backgroundColor: 'white', height: '100vh', font: '-moz-initial' }}>

      <Navbar className="navbar-dark bg-dark fixed-top">
        <div className="row" style={{ width: "100%" }}>
          <div className="col">
            <div className="row">
              <div className="col-auto" style={{ paddingLeft: "15px" }}>
                <img src="/redditicon.png" alt="Logo" className="navbar-brand mr-auto" style={{ maxWidth: '50px', maxHeight: '50px', paddingLeft: "15px" }} />
                <span className="navbar-brand mb-0 h1">Reddit Finance Search</span>
              </div>
              <div className="col">
                <div className="row align-items-center">
                  <div className="col">
                    <form className="form-inline my-2 my-lg-0" onSubmit={handleSubmit}>
                      <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" onChange={e => setSearch(e.target.value)} />
                    </form>
                  </div>
                  <div className="col-auto">
                    <button className="btn btn-outline-success my-2 my-sm-0"
                      style={{ marginLeft: "10px" }}
                      onClick={() => setShowAdvanced(!showAdvanced)} >
                      {showAdvanced ? "Hide" : "Show"} Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div >
            {showAdvanced ? advancedSearchOptions() : null}
          </div>
        </div>
      </Navbar>

      {showAdvanced && <div style={{ paddingTop: "25px" }}></div>}

      <div className="row" style={{ width: "100%" }}>
        <div className="col-auto">
          <PieChart
            data={[
              // match color to sentiment
              { title: 'One', value: 1, color: '#66bb6a' },
              { title: 'Two', value: 1, color: '#f44336' },
              { title: 'Three', value: 1, color: '#ffb74d' },
            ]} label={({ dataEntry }) => `${Math.round(dataEntry.percentage)} %`}
            labelStyle={{
              fontSize: '5px',
              fontFamily: 'sans-serif',
              fill: 'black',
            }}
          />
        </div>
        <div className="col">
          <Posts documents={documents} />
        </div>
      </div>



    </div>
  )
}