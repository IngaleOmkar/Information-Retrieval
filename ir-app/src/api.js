import axios from 'axios';
/**
 * 
* REGULAR QUERY API INPUT
 * 
 * inputData: {
 * query: string - must be present
 * start: YYYY-MM-DD - if not present just pass ""
 * end: YYYY-MM-DD - if not present just pass ""
 * sort_type: string - if not present just pass ""
 * }
 * 
 * sort can be one of the following:
 * 1. reddit_score asc for 
 * 2. reddit_score desc
 * 
 * VOTE API INPUT
 * 
 * inputData: {
 * doc_id: string - must be present and unique for each document
 * vote_type: string - must be present , up/down
 * query: string - must be present
 * start: YYYY-MM-DD - if not present just pass ""
 * end: YYYY-MM-DD - if not present just pass ""
 * sort_type: string - if not present just pass ""
 * }
 * 
 * sort can be one of the following:
 * 1. reddit_score asc => from the lowest score to the highest score
 * 2. reddit_score desc => from the highest score to the lowest score
 * 3. created asc => from the oldest post to the newest post
 * 4. created desc => from the newest post to the oldest post
 * 
 * 
 * outputData: {
 * documents:[
 * body:string[0],
 * created: string[0],
 * id: string,
 * score: number,
 * subreddit: string[0],
 * title: string[0]
 * ],
 * query_time: number,
 * spellcheck: string, - if none found standard "no spellcheck found"
 * total_results: number
 * }
 */

export const performQuery = async (inputData , type) => {
    let api_url = ""
    if(type === "query"){
        api_url = 'http://localhost:5000/get_query'
    }
    else if(type === "vote"){
        api_url = 'http://localhost:5000/vote_relevance'
    }
    else{
        console.error("Invalid type")
        return
    }

    console.log("api_url: ", api_url)
    try{
        const response = await axios.post(api_url, 
        {
            Headers: {
                'Content-Type': 'application/json'
            },
            ...inputData
        })

        
        if(response.status === 200){
            return response.data.results
        }
        else{
            console.error("Error from backend: ", response.data.error)
        }
    }
    catch(err){
        console.error("Error: " , err)
    }
}


