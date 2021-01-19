import React from 'react';

// Display login username and shortcut for login and sign up
const Navbar = (props) => {

    return(
        <div id='topbar'>
            <h5>
                {props.username === 'NO USER FOUND' ? `Not currently logged in` : `Currently logged in as ${props.username}`}
            </h5>
            <div id='navlogin'>
                <button onClick={props.login}><h5>Sign up</h5></button>
                <button className='text' onClick={props.login} ><h5>Log in</h5></button>
            </div>
        </div>
    );

}

export default Navbar;