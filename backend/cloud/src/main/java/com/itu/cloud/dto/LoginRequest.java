package com.itu.cloud.dto;

public class LoginRequest {
    private String email;
    private String mdp; // mot de passe (plaintext from client)

    public LoginRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMdp() { return mdp; }
    public void setMdp(String mdp) { this.mdp = mdp; }
}
