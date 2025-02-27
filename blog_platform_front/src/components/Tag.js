import React, { useState, useEffect } from 'react';
import {addTag, removeTag} from '../services/DataInterface';

function Tag({id, name, isSelected, onChange }) {
  const [buttonColor, setButtonColor] = useState('#AEBFBE');
  const [textColor, setTextColor] = useState('black');

  // Función para cambiar el color del botón
  useEffect(() => {
    if(isSelected) {
      setButtonColor('#003d39');
      setTextColor('white');
    }
  }, [isSelected]);

  const toggleButtonColor = () => {
    onChange();
    setButtonColor(prevColor => {
        if(prevColor === '#003d39') {
            removeTag(id);
            return '#AEBFBE';
        }
        else {
            addTag(id);
            return '#003d39';
        }
    });
    setTextColor(prevColor => {
        if(prevColor === 'white') {
            return 'black';
        }
        else {
            return 'white';
        }
    });
  };

  return (
    <div>
    <button
      onClick={toggleButtonColor}
      style={{ backgroundColor: buttonColor, color: textColor }}
    >
      {name}
    </button>
    </div>
  );
}

export default Tag;
