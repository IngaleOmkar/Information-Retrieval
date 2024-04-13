import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/esm/Button';
import { AiFillLike } from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdPerson } from "react-icons/io";
import React from 'react';
import { GrScorecard } from "react-icons/gr";
import { useState } from 'react';
import { BiUpvote, BiDownvote } from "react-icons/bi";


const Posts = ({ documents , handleVote}) => {
  const [sortOrder, setSortOrder] = useState('desc'); // Default to descending order

  // Function to toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // // Function to sort documents by score
  const sortDocumentsByScore = (docs) => {
    if (sortOrder === 'asc') {
      return docs.sort((a, b) => a.score - b.score);
    } else {
      return docs.sort((a, b) => b.score - a.score);
    }
  };

  // Sort documents by score
  const sortedDocuments = sortDocumentsByScore(documents);

  const getSubRedditPill = (subreddit) => {
    return (
      <Button variant="outline-primary" size="sm" disabled>{subreddit}</Button>
    );
  }

  const getSentimentPill = (sentiment) => {
    let variant = 'success';
    if (sentiment === 'negative') {
      variant = 'danger';
    } else if (sentiment === 'neutral') {
      variant = 'warning';
    }
    return (
      <Button variant={variant} size="sm" disabled>{sentiment}</Button>
    );
  }

  return (
    <div>
      {documents.map((document, index) => (
        <div key={index} className="post">
          <Card style={{ margin: "5px" }}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                {getSubRedditPill("r/" + document.subreddit)}
              </div>
              <div>
                {/* {getSentimentPill(document.sentiment)} */}
              </div>
            </Card.Header>
            <Card.Body>
              <Card.Title>{document.title}</Card.Title>
              <Card.Text>{document.body == "NaN"? "" : document.body}</Card.Text>
              <Card.Text>
                <div className='row' style={{ width: "100%" }}>
                  <div className="col-auto">
                    <AiFillLike /> {document.score}
                  </div>
                  <div className="col">
                    <FaCalendarAlt /> {document.created}
                  </div>
                  <div className="col-auto" style={{alignSelf:'flex-end' }}>
                    <Button style={{background:'none' , border:'none' , color:"grey"}} onMouseEnter={(e) => e.target.style.color = 'green'} onMouseLeave={(e) => e.target.style.color = 'grey'}  size="md" title='Upvote relevance' onClick={() => handleVote(document.id, 'up')}> <BiUpvote /> </Button>
                    <Button style={{background:'none' , border:'none' , color:"grey"}} onMouseEnter={(e) => e.target.style.color = 'red'} onMouseLeave={(e) => e.target.style.color = 'grey'} size="md" title='Downvote relevance' onClick={() => handleVote(document.id, 'down')}> <BiDownvote /> </Button>
                  </div>
                </div>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      ))}

    </div>
  );
};

export default Posts;
