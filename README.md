# SolYield Site Visit App - Submission

## 1. Project Description
A mobile application designed for efficient site visit management, featuring real-time location validation and scheduling. 

**Key Features (Level 1):**
* **Calendar Integration:** View and manage scheduled site visits.
* **Map & Location:** Visualizing site locations for field agents.
* **Geofenced Check-in:** Logic-based check-in that validates user location before allowing entry.

## 2. Screenshots
Below are the key screens from the Level 1 implementation.

| | | |
| :---: | :---: | :---: |
| ![Screen 1](Screenshots/1.jpeg) | ![Screen 2](Screenshots/2.jpeg) | ![Screen 3](Screenshots/3.jpeg) |
| ![Screen 4](Screenshots/4.jpeg) | ![Screen 5](Screenshots/5.jpeg) | ![Screen 6](Screenshots/6.jpeg) |
| ![Screen 7](Screenshots/7.jpeg) | ![Screen 8](Screenshots/8.jpeg) | ![Screen 9](Screenshots/9.jpeg) |
| ![Screen 10](Screenshots/10.jpeg)|

## 3. Video Walkthrough
Below is the screen recording demonstrating the Level 1 flow (Calendar -> Site Visit -> Check-in).

[![Watch Level 1 Demo](https://img.shields.io/badge/▶_Watch_Demo-Video-red?style=for-the-badge&logo=google-drive)](https://drive.google.com/file/d/1XKUy5miBC9R05nUhTDg5XrNGm7YHqil9/view?usp=drive_link)


## Level 2: The Offline Warrior
This phase implements robust offline persistence and data synchronization.

### 4. Approach & Architecture
- **Offline Engine:** Used **WatermelonDB** for high-performance local persistence.
- **Sync Logic:** Implemented a network listener that detects restoration and triggers a background sync of the serialized `form_schema.json`.
- **Media Handling:** Images are compressed locally before being stored as file paths in the DB.
 
## 5. Screenshots
Below are the key screens from the Level 2 implementation.
| | | |
| :---: | :---: | :---: |
| ![Screen 11](Screenshots/11.jpeg) |![Screen 12](Screenshots/12.jpeg) |![Screen 13](Screenshots/13.jpeg)|
|![Screen 14](Screenshots/14.jpeg)|

## 6.Video Walkthrough
Below is the screen recording demonstrating the Level 2 flow (Offline DB -> Sync on Reconnect -> Visual Evidence).

[![Watch Level 2 Demo](https://img.shields.io/badge/▶_Watch_Demo-Video-red?style=for-the-badge&logo=google-drive)](https://drive.google.com/file/d/1JVBHzhAZCXdNpe-NMZHdl8KzEnHOpEMx/view?usp=drivesdk)
