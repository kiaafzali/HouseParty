import React, { Component } from "react";
import {TextField, Button, Grid, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import {withRouter} from './withRouter';

class JoinRoom extends Component {
    constructor(props){
        super(props);
        this.state = {
            error: "",
            room_code: "",
        };
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.roomButtonPressed = this.roomButtonPressed.bind(this);

    };


    render(){
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align ="center">
                    <Typography variant="h4" component="h4">
                        Join a Room
                    </Typography>
                </Grid>
                <Grid item xs={12} align ="center">
                    <TextField 
                    error={this.state.error}
                    label="Code"
                    placeholder = "Enter a Room Code"
                    value = {this.state.room_code}
                    helperText={this.state.error}
                    variant="outlined"
                    onChange={this.handleTextFieldChange}
                    />
                </Grid>
                <Grid item xs={12} align ="center">
                    <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={this.roomButtonPressed}
                    >
                        Enter Room
                    </Button>
                </Grid>
                <Grid item xs={12} align ="center">
                    <Button 
                    variant="contained" 
                    color="secondary" to="/" 
                    component={Link}
                    >
                        Back
                    </Button>
                </Grid>
            </Grid>
        );
    }


    handleTextFieldChange(e){
        this.setState({
            room_code: e.target.value,
        });
    }

    roomButtonPressed(){
        const reqeuestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                code: this.state.room_code,
            }),
        }
        
        fetch("/api/join-room", reqeuestOptions)
        .then((response) => {
            if(response.ok){
                this.props.navigate("/room/" + this.state.room_code);
            } else {
                this.setState({ error: "Room not Found."});
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }
}

export default withRouter(JoinRoom);