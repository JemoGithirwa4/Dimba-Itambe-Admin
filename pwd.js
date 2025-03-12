import pg from "pg";
import bcrypt from "bcrypt";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "dimbaitambe",
    password: "@Kukurella17",
    port: 5432
});

async function updateAdminPassword() {
    try {
        await db.connect();

        const email = 'jameswaina4@gmail.com';
        const newPassword = 'password'; // Replace with your actual password
        const saltRounds = 10;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Delete existing password entry for the admin email
        await db.query('DELETE FROM admin_users WHERE email = $1', [email]);

        // Insert new hashed password
        await db.query(
            'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)',
            [email, hashedPassword]
        );

        console.log('Admin password updated successfully.');
    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await db.end();
    }
}

updateAdminPassword();
