import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/esm/Button';
import { AiFillLike } from "react-icons/ai";
import { IoMdPerson } from "react-icons/io";
import React from 'react';
import { useState } from 'react';
const Posts = ({ documents }) => {
    const [sortOrder, setSortOrder] = useState('desc'); // Default to descending order
  
    // Function to toggle sort order
    const toggleSortOrder = () => {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };
  
    // Function to sort documents by score
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
  
    return (
      <div>
        <div>
          <h2>Search Results</h2>
        </div>

        {/* {sortedDocuments.map((document, index) => (
          <div key={index} className="post">
            <h3>{document.title}</h3>
            <p>Subreddit: {document.subreddit}</p>
            <p>Score: {document.score}</p>
            <p>{document.body}</p>
          </div>
        ))} */}

        {sortedDocuments.map((document, index) => (
          <div key={index} className="post">
            <Card>
              <Card.Header>
                <IoMdPerson />  {document.id} · {getSubRedditPill("r/" + document.subreddit)}
              </Card.Header>
              <Card.Body>
                <Card.Title>{document.title}</Card.Title>
                <Card.Text>{document.body}</Card.Text>
                <Card.Text> <AiFillLike /> {document.score} </Card.Text>
              </Card.Body>
            </Card>
          </div>
        ))}

      </div>
    );
  };
  
  export default Posts;