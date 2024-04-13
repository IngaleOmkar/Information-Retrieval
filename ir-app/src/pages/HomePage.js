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
import Button from "react-bootstrap/esm/Button";
import DatePicker from "react-datepicker";
import { FaMicrochip } from "react-icons/fa6";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import "react-datepicker/dist/react-datepicker.css";

export default function HomePage() {
  const [search, setSearch] = useState(''); //search bar 
  //Set filter options 
  const [timeFilter, setTimeFilter] = React.useState('Date Posted');
  const [sentimentFilter, setSentimentFilter] = React.useState('Sentiment');
  const [scoreFilter, setScoreFilter] = React.useState('Reddit Score');
  // Submit filter options
  const [time, setTime] = React.useState("");
  const [sentiment,setSentiment] = React.useState("Sentiment");
  const [score,setScore] = React.useState("");
  const [documents, setDocuments] = useState([]); //holds result of reddit posts
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [queryTime, setQueryTime] = useState(''); // time to execute the query

  // set a boolean flag to check if word cloud was generated 
  const [wordCloud, setWordCloud] = useState(false);

  // The following are for pagination
  const [page, setPage] = useState(1); // current page number
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;
  const [documentsForCurrentPage, setDocumentsForCurrentPage] = useState([]);

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

    if (search != "") { 
    //fetch the data from the servers
        const inputData = {
          "query" : search, 
          "start" : start,
          "end" : end,
          "sort_type" : {
            "time" : time,
            "sentiment" : sentiment,
            "score" : score
          }
        };

        console.log(inputData)
        const response = await axios.post("http://127.0.0.1:5000/get_query", 
        {
            Headers: {
                'Content-Type': 'application/json'
            },
            ...inputData
        });

        //console.log("Response: ", response.data)
        console.log(response.data.results.documents)
        if(response.status === 200){
          setDocuments(response.data.results.documents); // all the received documents
          setWordCloud(true);

          // set the total number of pages
          setTotalPages(Math.ceil(response.data.results.documents.length / postsPerPage));
          // set the documents for the current page
          setDocumentsForCurrentPage(response.data.results.documents.slice((page - 1) * postsPerPage, page * postsPerPage));

          setQueryTime(response.data.results.query_time);
        }
        else{
          console.error("Error from backend: ", response.data.error);
        }
    }
    else { 
      console.log("Query is empty.")
    }

    
  }
  
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

  // handle page change
  const handlePageChange = (event, value) => {
    setPage(value);

    // set the documents for the current page
    setDocumentsForCurrentPage(documents.slice((value - 1) * postsPerPage, value * postsPerPage));
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
                      onClick={handleSubmit} >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{marginLeft:"20px"}}>
            <span className="navbar-brand mb-0 h3" style={{display:'inline-block'}}>Search from: </span>
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)}/>
            <span style={{marginLeft:"10px"}}className="navbar-brand mb-0 h3"> to:</span>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
            <button className="btn btn-outline-success my-2 my-sm-0"
                        style={{ marginLeft: "10px" }}
                        onClick={() => resetTime()} >
                        Reset 
            </button>
          
          </div>
        </div>
      </Navbar>

      <div className="row align-items-start" style={{ width: "100%",marginTop:'30px',zIndex:'1'}}>
        <div className="col-auto sticky-top" style={{marginLeft:'10px',marginTop:'50px',maxWidth:'25%',zIndex:'0'}}>
          <h3>Distribution of Sentiments in Search Results</h3>
          {wordCloud && <PieChart
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
          />}
          {/* PLACEHOLDER FOR WORD CLOUD */}
          <div className="col-auto" style={{marginTop:"30px"}}>
            <h5>Legend</h5>
            <div>
              <Button variant='success' size="sm" disabled>Positive</Button>
              <Button variant='warning' size="sm" disabled style={{margin: "5px"}}>Neutral</Button>
              <Button variant='danger' size="sm" disabled>Negative</Button>
            </div>
          </div>
          <h3 style={{paddingTop: "15px"}}>Generated WordCloud</h3>
          {wordCloud && <img src={require("../assets/images/wordcloud.png")} alt="Word Cloud" style={{maxWidth:'100%',maxHeight:'100%'}}/>}
        </div>
        <div className="col" >
          <div className='row justify-content-between'>
            <div className='col-auto'>
              
              <div className="row">
                <div className="col-auto">
                  <h2>Search Results</h2>
                </div>
                <div className="col-auto">
                  <DropdownButton id="time" variant="outline-dark" menuVariant="light" title={timeFilter}>
                    <Dropdown.Item onClick={() => { setTimeFilter("Date Posted"); setTime("") }} >Date Posted</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => { setTimeFilter("Most recent"); setTime('created desc') }}>Most recent</Dropdown.Item>
                    <Dropdown.Item onClick={() => { setTimeFilter("Least recent"); setTime('created asc') }}>Least recent</Dropdown.Item>
                  </DropdownButton>
                </div>
                <div className="col-auto">
                <DropdownButton id="Sentiment" variant="outline-dark" menuVariant="light" title={sentimentFilter}>
                    <Dropdown.Item onClick={() => { setSentimentFilter("Sentiment"); setSentiment("") }}>Sentiment</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => { setSentimentFilter("Positive"); setSentiment('Positive') }}>Positive</Dropdown.Item>
                    <Dropdown.Item onClick={() => { setSentimentFilter("Negative"); setSentiment('Negative') }}>Negative</Dropdown.Item>
                    <Dropdown.Item onClick={() => { setSentimentFilter("Neutral"); setSentiment('Neutral') }}>Neutral</Dropdown.Item>
                  </DropdownButton>
                </div>
                <div className="col-auto">
                  <DropdownButton id="score" variant="outline-dark" menuVariant="light" title={scoreFilter}>
                    <Dropdown.Item onClick={() => { setScoreFilter("Reddit Score"); setScore("") }} >Reddit Score</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => { setScoreFilter("Ascending"); setScore('reddit_score asc') }}>Ascending</Dropdown.Item>
                    <Dropdown.Item onClick={() => { setScoreFilter("Descending"); setScore('reddit_score desc') }}>Descending</Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
              {/* Replace with variables depending on page numbers */}
              {wordCloud && <h6><b><i>Showing results {((page - 1) * postsPerPage) + 1} to {(page * postsPerPage > documents.length)?documents.length:(page * postsPerPage)} of {documents.length}. Query Executed in {queryTime} ms.</i></b></h6> }
            </div>
            <div className='col-auto'>
              <Button variant="primary" size="sm">
                <FaMicrochip /> Generate Insight
              </Button>
            </div>
          </div>
          <Posts documents={documentsForCurrentPage} />
          {/* Create a div that occupies the entire column and centers the lements within it */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '30px'}}>
            {wordCloud && <Pagination count={totalPages} onChange={handlePageChange} />}
          </div>
        </div>
      </div>
    </div>
  )
}