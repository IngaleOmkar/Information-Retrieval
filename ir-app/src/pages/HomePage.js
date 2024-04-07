import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { TextField, MenuItem } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { Typography } from "@mui/material";
// import {ToastContainer,toast} from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import React from "react";
import axios from 'axios'
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import dayjs from 'dayjs';
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
        // axiosAuth(
        //         {
        //             method:'GET', 
        //             url:`/singleQuery/${protocol}/${source}/${ip}`,
        //         }
        //     ).then(function (response){ 
        //         const listo = []
        //         listo.push(response.data.response);
        //         console.log(listo)
        //         setData(listo);
        //     }
        //     ).catch (function (error){ 
        //         toast.error(error.response.data.errorMessage);
        //     })   
    }


    

    // useEffect(handleSubmitIP,[source]);


    return (
        <div id="Page" className="Page">

            <div className='Top'>
                <img className='icon' src="/redditicon.png" alt="image" />
                <div className="Title">
                    <Typography style={{"marginTop":"15px","marginBottom":"15px","marginLeft":"25px","marginRight":"25px"}} color="common.white" variant="h5">Reddit Search</Typography>
                </div>
            </div>
 
            {checked && <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateRangePicker', 'DateRangePicker']}>

                    <DemoItem label="Filter By Date" component="DateRangePicker">
                    <DateRangePicker
                        value={value}
                        onChange={(newValue) => setValue(newValue)}
                    />
                    </DemoItem>
                </DemoContainer>
                </LocalizationProvider>
            </div>}

  
            <div className="submit">
            <TextField fullWidth  onChange={e=>setSearch(e.target.value)} />
            <FormGroup>
            <FormControlLabel control={
            <Switch
            checked={checked}
            onChange={handleDateToggle}
            inputProps={{ 'aria-label': 'controlled' }}
            />    
            } label="Filter by Date" />
            </FormGroup>
     
            <Button endIcon={<SearchIcon/>} size="medium" variant="contained" onClick={e=>{handleSubmit()}}>Search</Button> 
            </div>   



            <Posts documents={documents} />
        </div>
    ) 
}