import { useState, useEffect } from 'react';
import { update_calification, calificate_post } from '../services/Api';

function Calificate({myCalification, token, post_id, onChange, calification_id}) {
    const [calification, setCalification] = useState(0);
    const [itWasCalificated, setItWasCalificated] = useState(false);

    useEffect(() =>{
        if(myCalification !== -1){
            setCalification(myCalification);
        }
        else{
            setCalification(0);
            setItWasCalificated(false);
        }
        if(calification_id !== 0){
            setItWasCalificated(true);
        }
        
    },[myCalification]);

    const handleCalification = (e) => {
        //parse text entry to int, check if it really is a number
        const calification1 = parseInt(e.target.value);
        if(isNaN(calification1)){
            setCalification(0);
            return;
        }
        //check if it is in the range
        if(calification1 < 0 || calification1 > 5){
            setCalification(0);
            return;
        }
        setCalification(calification1);
        return;

    }

    const handleKeyDown = async(e) => {
        if(e.key === "Enter"){
            if(itWasCalificated){
                await update_calification(calification_id, post_id, calification, token);
                
                setItWasCalificated(true);
            }
            else{
                await calificate_post(post_id, calification, token);
                setItWasCalificated(true);
                setCalification(calification);
            }
           
            onChange();
        }
    }
    return(
        <div>
            <input type="text" value={calification} onChange={handleCalification} onKeyDown={handleKeyDown} placeholder={calification}/>
        </div>
    );
}
export default Calificate;