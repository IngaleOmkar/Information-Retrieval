import { useState, useEffect } from "react";
// import { Button } from "@mui/material";
// import { TextField, MenuItem } from "@mui/material";
// import SearchIcon from '@mui/icons-material/Search';
// import { Typography } from "@mui/material";

import "bootstrap/dist/css/bootstrap.min.css";

import React from "react";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios'
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import dayjs from 'dayjs';
import Nav from 'react-bootstrap/Nav';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import Posts from "../components/Posts";

export default function HomePage() { 
  const [search,setSearch] = useState(''); //search bar 
  const [data,setData] = useState([]); //holds result of reddit posts
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

  const documents = [
    {
      title: 'Title 1',
      subreddit: 'ReactJS',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      score: 10.14
    },
    {
      title: 'Title 2',
      subreddit: 'JavaScript',
      body: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      score: 15.23
    },
    // Add more documents as needed
  ];

  const handleSubmit = ( event ) => { 
    console.log("Query")
    setData([])
    const apiUrl = `http:localhost:8000/search/${search}`
    axios.get(apiUrl)
    .then(response => {
      // Handle success
      console.log('Response:', response.data);
    })
    .catch(error => {
      // Handle error
      console.error('Error:', error);
    }); 
  }

  const toggleAdvancedSearchOptions = () => {setShowAdvanced(!showAdvanced)};


  const advancedSearchOptions = () => {
    return (
      <div>
        <DropdownButton
          id="time"
          variant="outline-light"
          menuVariant="dark"
          title={timeFilter}
          className="mt-2"
          style={{ marginLeft: '15px' }}>
            <Dropdown.Item  onClick={() => { setTimeFilter("Time") }} >
                Time
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => { setTimeFilter("Most recent"); setTime('date desc') }}>Most recent</Dropdown.Item>
            <Dropdown.Item  onClick={() => { setTimeFilter("Least recent"); setTime('date asc') }}>Least recent</Dropdown.Item>
        </DropdownButton>
        <DropdownButton
          id="time"
          variant="outline-light"
          menuVariant="dark"
          title={timeFilter}
          className="mt-2"
          style={{ marginLeft: '15px' }}>
            <Dropdown.Item  onClick={() => { setTimeFilter("Time") }} >
                Time
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => { setTimeFilter("Most recent"); setTime('date desc') }}>Most recent</Dropdown.Item>
            <Dropdown.Item  onClick={() => { setTimeFilter("Least recent"); setTime('date asc') }}>Least recent</Dropdown.Item>
        </DropdownButton>
      </div>
    );
  }

  return (
    <div id="Page" className="Page" style={{backgroundColor: 'white', height: '100vh', font:'-moz-initial'}}>

      <Navbar className="navbar-dark bg-dark fixed-top">
        <div className="row" style={{width: "100%"}}>
          <div className="col">
            <div className="row">
              <div className="col-auto" style={{paddingLeft: "15px"}}>
                <img src="/redditicon.png" alt="Logo" className="navbar-brand mr-auto" style={{ maxWidth: '50px', maxHeight: '50px', paddingLeft: "15px"}}/>
                <span className="navbar-brand mb-0 h1">Reddit Finance Search</span>
              </div>
              <div className="col">
                <div className="row align-items-center">
                  <div className="col">
                    <form className="form-inline my-2 my-lg-0">
                      <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" onChange={e => setSearch(e.target.value)}/>
                    </form>
                  </div>
                  <div className="col-auto">
                    <button className="btn btn-outline-success my-2 my-sm-0"
                      style={{marginLeft: "10px"}}
                      onClick={() => setShowAdvanced(!showAdvanced)} >
                      {showAdvanced ? "Hide" : "Show"} Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            { showAdvanced ? advancedSearchOptions() : null }
          </div>
        </div>
      </Navbar>


      
    </div>
  ) 
}