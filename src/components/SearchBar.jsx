import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = e => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div>
      <input type="text" placeholder="Search by name" value={searchQuery} onChange={handleChange} />
    </div>
  );
};

export default SearchBar;
