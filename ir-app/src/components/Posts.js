
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
  
    return (
      <div className="posts">
        <div className="posts_top">
            <h2>Search Results</h2>
            <button onClick={toggleSortOrder}>
            {sortOrder === 'asc' ? 'Sort by Descending Reddit Score' : 'Sort by Ascending Reddit Score'}
            </button> 
        </div>

        {sortedDocuments.map((document, index) => (
          <div key={index} className="post">
            <h3>{document.title}</h3>
            <p>Subreddit: {document.subreddit}</p>
            <p>Score: {document.score}</p>
            <p>{document.body}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default Posts;