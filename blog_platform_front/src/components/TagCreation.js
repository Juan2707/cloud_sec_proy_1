import React, { useState, useEffect } from 'react';

function TagCreation({ tags, onTagsChange }) {
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    onTagsChange(selectedTags);
  }, [selectedTags, onTagsChange]);

  const toggleTag = tag => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div>
      {tags.map((tag, index) => (
        <button key={index} onClick={() => toggleTag(tag)} style={{ margin: '5px', backgroundColor: selectedTags.includes(tag) ? 'blue' : 'gray' }}>
          {tag}
        </button>
      ))}
    </div>
  );
}

export default TagCreation;
