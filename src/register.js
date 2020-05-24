import React from 'react'


class Register extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            newUserEmail:'',
            newUserFirstName:'',
            newUserLastName:'',
            newUserPassword:''
        }
    }

    onNewUserFirstNameChange = (event) =>{
        this.setState({newUserFirstName: event.target.value});
    }

    onNewUserLastNameChange = (event) =>{
        this.setState({newUserLastName: event.target.value});
    }

    onNewUserEmailChange = (event) => {
        this.setState({newUserEmail: event.target.value});
    }

    onNewUserPasswordChange = (event) => {
        this.setState({newUserPassword: event.target.value});
    }

    onRegisterClick = () => {
        console.log('state',this.state);
        
        fetch('https://memriio-api-0.herokuapp.com/register', {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify({
                    email:this.state.newUserEmail,
                    password: this.state.newUserPassword,
                    firstname: this.state.newUserFirstName,
                    lastname: this.state.newUserLastName
                })
            })
                .then(response => response.json())
                .then(user => {
                    
                    
                 if(user.userid){
                    this.props.loadUser(user)
                    this.props.onRouteChange('home')
                 }else{
                    this.setState({newUserPassword:''})   
                    this.setState({newUserEmail:''})   
                    this.setState({newUserFirstName:''})
                    this.setState({newUserLastName:''})
                 }
             })
        }

    render(){
        
        return (
            <article className="br3 ba dark-gray b--black-1 mv4 w-100 w-50-m w-25-l mw6 center">
                <main className="pa4 black-80">
                    <div className="measure center">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                            <legend className="f4 fw6 ph0 mh0">Register</legend>
    
                            <div className="mt3">
                                <label className="db fw6 lh-copy f6" htmlFor="name">First Name</label>
                                <input 
                                    onChange={this.onNewUserFirstNameChange}
                                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                                    type="text" 
                                    name="firstname" 
                                    id="firstname" />
                            </div>
                            <div className="mt3">
                                <label className="db fw6 lh-copy f6" htmlFor="name">Last Name</label>
                                <input 
                                    onChange={this.onNewUserLastNameChange}
                                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                                    type="text" 
                                    name="lastname" 
                                    id="lastname" />
                            </div>
                            <div className="mt3">
                                <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                                <input 
                                    onChange={this.onNewUserEmailChange}
                                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                                    type="email" 
                                    name="email-address"  
                                    id="email-address" />
                            </div>
    
                            <div className="mv3">
                                <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                                <input 
                                    onChange={this.onNewUserPasswordChange}
                                    className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                                    type="password" 
                                    name="password"  
                                    id="password"/>
                            </div>
                            
                        </fieldset>
                        <div>
                        <input 
                            
                            onClick={this.onRegisterClick}
                            className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" 
                            type="submit" 
                            value="Register"/>
                        </div>
                        
                    </div>
                </main>
            </article>
        )
    }
    
}

export default Register