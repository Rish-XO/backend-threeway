const router = require("express").Router();
const pool = require("../db");

// Express route for creating a room
router.post("/roomId", async (req, res) => {
  const { ownerID, user_id, post_id, orderData } = req.body;
  try {
    // Check if a matching room already exists
    const existingRoomQuery = await pool.query(
      "SELECT room_id FROM rooms WHERE transporter = $1 AND manufacturer = $2 AND post_id = $3",
      [user_id, ownerID, post_id]
    );

    if (existingRoomQuery.rows.length > 0) {
      // Return the existing room ID
      const roomID = existingRoomQuery.rows[0].room_id;
      return res.status(200).json({ roomID });
    }

    // Create a new row in the room table if room doesn't exist
    const roomQuery = await pool.query(
      "INSERT INTO rooms (post_id, manufacturer, transporter) VALUES ($1 , $2, $3) RETURNING *",
      [post_id, ownerID, user_id]
    );
    const roomID = roomQuery.rows[0].room_id;

    // Save the first order message of manufacturer
    const orderMessage = JSON.stringify(orderData);
    const saveOrderQuery = await pool.query(
      "INSERT INTO messages (post_id,user_id, content, role) VALUES ($1 , $2, $3, 'manufacturer') RETURNING *",
      [post_id, ownerID, orderMessage]
    );

    // Saving the order details to orders table
    await pool.query(
      'INSERT INTO orders (order_id, "from", "to", manufacturer, transporter) VALUES ($1, $2, $3, $4, $5)',
      [post_id, orderData.from, orderData.to, ownerID, user_id]
    );

    res.status(200).json({ roomID });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "An error occurred while creating the room." });
  }
});

// get all rooms
router.post("/getRooms", async (req, res) => {
  const { user } = req.body;
  // console.log('user id from client', user);
  try {
    const rooms = await pool.query(
      "SELECT * FROM rooms WHERE manufacturer = $1 OR transporter = $1",
      [user]
    );
    const orders = rooms.rows;
    console.log(orders);
    res.status(200).json({ orders });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred while fetching rooms." });
  }
});

// save a message
router.post("/saveMessage", async (req, res) => {
  const { message, orderID, userID, role } = req.body;
  try {
    await pool.query(
      "INSERT INTO messages (user_id , content, role, post_id) VALUES ($1,$2,$3,$4)",
      [userID, message, role, orderID]
    );
  } catch (error) {
    console.log(error.message);
  }
});

// get all messages from a order chat
router.get("/getMessages/:orderID", async (req, res) => {
  const { orderID } = req.params;
  try {
    const chat = await pool.query(
      "SELECT content FROM messages WHERE post_id = $1",
      [orderID]
    );
    const messages = chat.rows.map((row) => {
      try {
        const message = JSON.parse(row.content);
        return message;
      } catch {
        return row.content; // If parsing fails, return the original content as string
      }
    });

    // console.log("all message from database", messages);
    res.status(200).json(messages);
  } catch (error) {
    console.log(error.message);
  }
});

//search for rooms
router.post("/searchRooms", async (req, res) => {
  const { searchType, searchValue, currentUser } = req.body;

  try {
    let searchQuery = "";
    let searchParams = [];

    if (searchType === "orderID") {
      searchQuery =
        "SELECT * FROM orders WHERE order_id = $1 AND (manufacturer = $2 OR transporter = $2)";
      searchParams = [searchValue, currentUser];
    } else if (searchType === "from") {
      searchQuery =
        'SELECT * FROM orders WHERE "from" = $1 AND (manufacturer = $2 OR transporter = $2)';
      searchParams = [searchValue, currentUser];
    } else if (searchType === "to") {
      searchQuery =
        'SELECT * FROM orders WHERE "to" = $1 AND (manufacturer = $2 OR transporter = $2)';
      searchParams = [searchValue, currentUser];
    }

    const searchResults = await pool.query(searchQuery, searchParams);

    if (searchResults.rows.length > 0) {
      return res.status(200).json({ orders: searchResults.rows });
    } else {
      return res.status(404).json({ message: "No orders found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred while searching." });
  }
});

//get current address api and available transporters
router.get("/getAddress/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    // console.log(user_id);
    const data = await pool.query(
      "select address from users where user_id = $1",
      [user_id]
    );
    const transportersData = await pool.query(
      "SELECT * FROM users WHERE role = 'transporter'"
    );

    const transporters = transportersData.rows.map((item) => ({
      user_id: item.user_id,
      firstname: item.firstname,
    }));

    //console.log(transporters);
    const address = data.rows[0].address;
    res.json({ address, transporters });
  } catch (error) {
    console.log("on getting address", error.message);
  }
});

module.exports = router;
