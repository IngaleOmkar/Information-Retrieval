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

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default function HomePage() {
  const [search, setSearch] = useState(''); //search bar 
  // Create boolean flag for showing advanced search options
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  //Set filter options 
  const [timeFilter, setTimeFilter] = React.useState('Time');
  // Submit filter options
  const [time, setTime] = React.useState('date desc');

  // const handleDateToggle = (event) => {
  //   setChecked(event.target.checked);
  // };

  const [documents, setDocuments] = useState([]); //holds result of reddit posts
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const resetTime = () => { 
    setStartDate(null);
    setEndDate(null);
  }

  const convertToYYYYMMDD = (input) => { 

    if (input == null) { 
      return ""
    }
    
    const date = new Date(input);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const output = `${year}-${month}-${day}`;

    return output

  }

  const handleSubmit = async (event) => {
    // this function will test if the server is running for now
    // a simple fetch command for: http://127.0.0.1:5000/query?q=tesla
    // log the response 

    // prevent the page from refreshing
    event.preventDefault();
    //formatting datepicker to yyyy/mm/dd
    const start = convertToYYYYMMDD(startDate);
    const end = convertToYYYYMMDD(endDate);
    console.log(start)
    console.log(end)

    //fetch the data from the servers
    const inputData = {
      "query" : search, 
      "start" : start,
      "end" : end,
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
      <Navbar className="navbar-dark bg-dark">
        <div className="row" style={{ width: "100%",zIndex:"999" }}>
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
          <div style={{marginLeft:"20px"}}>
          <span className="navbar-brand mb-0 h3">Search from: </span>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)}
          />
          <span style={{marginLeft:"10px"}}className="navbar-brand mb-0 h3"> to:</span>
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
          <button className="btn btn-outline-success my-2 my-sm-0"
                      style={{ marginLeft: "10px" }}
                      onClick={() => resetTime()} >
                      Reset 
                    </button>
            {showAdvanced ? advancedSearchOptions() : null}
          </div>
        </div>
      </Navbar>

      {showAdvanced && <div style={{ paddingTop: "25px"}}></div>}

      <div className="row align-items-start" style={{ width: "100%",marginTop:'30px',zIndex:'1'}}>
        <div className="col-auto sticky-top" style={{marginLeft:'10px',marginTop:'50px',maxWidth:'25%',zIndex:'0'}}>
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
          {/* PLACEHOLDER FOR WORD CLOUD */}
          <div className="col-auto" style={{marginTop:"30px"}}>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra consequat urna, nec iaculis purus ullamcorper nec. Mauris laoreet odio a justo tincidunt feugiat. Phasellus nec diam non dui rutrum consequat. Vivamus consequat orci nec ex sollicitudin varius. Vestibulum id lectus quis felis facilisis sollicitudin. Vivamus varius odio et lacus pharetra volutpat. Nunc eu elit ut elit congue fermentum. Donec sed est a ligula vestibulum consequat. Maecenas ultricies, libero vel eleifend ultricies, enim odio aliquet nunc, nec consectetur est purus vitae eros.</p>
            <p>Nullam nec velit id eros accumsan mattis. Aliquam eget metus sed enim hendrerit placerat in vitae tortor. Vestibulum eu lacus in magna rutrum auctor. Morbi auctor tempus ex nec pellentesque. Nam nec ultricies elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse ullamcorper nibh vitae ipsum maximus, vel faucibus tortor viverra. In hac habitasse platea dictumst. Ut quis diam eu sapien accumsan pharetra. Vivamus gravida tellus nec est aliquam, vitae eleifend mauris tincidunt. Nulla facilisi. Duis rhoncus, sapien ac consectetur volutpat, mi augue gravida ex, at consectetur nisl nulla auctor dolor. In rutrum ligula eget augue mattis auctor. Proin dictum nibh a mauris hendrerit, eu fermentum quam ultricies.</p>

          </div>

        </div>
        <div className="col" >
          <Posts documents={documents} />
        </div>
      </div>



    </div>
  )
}