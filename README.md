# Eventzone

Eventzone is a platform for managing events, where users can view, apply for, and manage event-related activities. The platform provides features such as event creation, user applications, and a dashboard for admins to track applications and manage events.

## Features

- **Event Creation**: Admins can create new events with details like name, date, description, and payment handling.
- **User Applications**: Users can apply for events by submitting their details and payment screenshots.
- **Admin Dashboard**: Admins can manage applications, view event details, and update application statuses.
- **QR Code for Payments**: If an event is paid, users receive a QR code to complete the payment process.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Payment**: Razorpay (for paid events)
- **Authentication**: JWT for user authentication

## Setup

### Prerequisites

- Node.js (v14.x or higher)
- npm or yarn
- MongoDB (local or cloud)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Sanjeev-k-11/Eventzone.git
    ```

2. Navigate into the project directory:
    ```bash
    cd Eventzone
    ```

3. Install dependencies:
    - For frontend:
        ```bash
        cd frontend
        npm install
        ```
    - For backend:
        ```bash
        cd backend
        npm install
        ```

4. Create `.env` files in both the **frontend** and **backend** directories and set your environment variables like API keys, MongoDB URI, etc.

### Run the Project

1. Run the backend:
    ```bash
    cd backend
    npm run start
    ```

2. Run the frontend:
    ```bash
    cd frontend
    npm run dev
    ```

The app will now be running locally at [http://localhost:4000](http://localhost:4000).

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to your branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Created by**: [Sanjeev Kumar](https://github.com/Sanjeev-k-11)
