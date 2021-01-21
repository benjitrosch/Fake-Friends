import React , { useEffect } from 'react';

const Menu = (props) => {

    useEffect(() => {
        document.getElementById('root').style.width = '50%';
        document.getElementById('root').style.backgroundColor = 'white';
    })
    
    return(
        <div id='menubuttoncontainer'>
            <div id='create'>
                <button className='createBtn' onClick={props.newSurvey} disabled={!props.enabled} >Create New Survey</button>
                <button className='createBtn' onClick={props.getSurveys} disabled={!props.enabled} >My Surveys</button>
            </div>
            <div id='play'>
                <button id='startBtn' onClick={props.enterRoom} disabled={!props.enabled} >Enter Room Code</button>
            </div>
        </div>
    );
}

export default Menu;