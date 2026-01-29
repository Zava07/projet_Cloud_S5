package com.itu.cloud.controller;

import com.itu.cloud.dto.UserDTO;
import com.itu.cloud.dto.ReportSummaryDTO;
import com.itu.cloud.dto.EntrepriseSummaryDTO;
import com.itu.cloud.entity.User;
import com.itu.cloud.dto.SignupRequest;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.service.UserService;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDTO> list(@RequestParam(name = "includeEntreprises", defaultValue = "false") boolean includeEntreprises,
                              @RequestParam(name = "includeReports", defaultValue = "false") boolean includeReports) {
        List<User> users = userService.findAllWithRelations(includeEntreprises, includeReports);
        return users.stream().map(u -> EntityToDtoMapper.toUserDTO(u, includeEntreprises, includeReports)).collect(Collectors.toList());
    }

        @GetMapping("/{id}")
        public ResponseEntity<UserDTO> get(@PathVariable Long id,
                           @RequestParam(name = "includeEntreprises", defaultValue = "false") boolean includeEntreprises,
                           @RequestParam(name = "includeReports", defaultValue = "false") boolean includeReports) {
        return userService.findByIdWithRelations(id, includeEntreprises, includeReports)
            .map(u -> EntityToDtoMapper.toUserDTO(u, includeEntreprises, includeReports))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/{id}/reports")
        public ResponseEntity<List<ReportSummaryDTO>> reports(@PathVariable Long id) {
            return userService.findByIdWithRelations(id, false, true)
                    .map(u -> u.getReports().stream().map(EntityToDtoMapper::toReportSummary).collect(Collectors.toList()))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/{id}/entreprises")
        public ResponseEntity<List<EntrepriseSummaryDTO>> entreprises(@PathVariable Long id) {
            return userService.findByIdWithRelations(id, true, false)
                    .map(u -> u.getEntreprises().stream().map(EntityToDtoMapper::toEntrepriseSummary).collect(Collectors.toList()))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/with-reports")
        public List<UserDTO> withReports() {
            List<User> users = userService.findAllWithRelations(false, true);
            return users.stream().map(u -> EntityToDtoMapper.toUserDTO(u, false, true)).collect(Collectors.toList());
        }

        @GetMapping("/with-entreprises")
        public List<UserDTO> withEntreprises() {
            List<User> users = userService.findAllWithRelations(true, false);
            return users.stream().map(u -> EntityToDtoMapper.toUserDTO(u, true, false)).collect(Collectors.toList());
        }

    @PostMapping
    public UserDTO create(@RequestBody User user) {
        Optional<User> existing = userService.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("A user with the given email already exists.");
        }
        User saved = userService.save(user);
        return EntityToDtoMapper.toUserDTO(saved, true, true);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        if (req.getEmail() == null || req.getPassword() == null || req.getFirstName() == null || req.getLastName() == null) {
            return ResponseEntity.badRequest().body("Missing fields");
        }
        if (userService.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body("Email already in use");
        }
        User u = new User();
        u.setEmail(req.getEmail());
        u.setPasswordHash(req.getPassword()); // TODO: hash the password
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setVerified(Boolean.FALSE);
        User saved = userService.save(u);
        // Do not create or return a verification token per requested change
        return ResponseEntity.status(201).body(EntityToDtoMapper.toUserDTO(saved, false, false));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        User saved = userService.save(user);
        return ResponseEntity.ok(EntityToDtoMapper.toUserDTO(saved, true, true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
