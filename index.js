import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    fs.readdir('./files', (err, files) => {
        if (err) throw err;
        res.render("index", {files});
    })
});

app.get('/files/:filename', (req, res) => {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", (err, filedata) => {
        res.render("show", { filename: req.params.filename, filedata: filedata });
    })
});

app.post("/create", (req, res) => {
    fs.writeFile(`./files/${req.body.title.split(' ').join('')}`, req.body.description, (err) =>{
        if (err) throw err;
        res.redirect("/");
    });
});

app.delete("/delete-task/:filename", (req, res) => {
    const filePath = path.join(__dirname, "files", req.params.filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, message: "Task deleted successfully" });
        });
    } else {
        res.status(404).json({ success: false, error: "File not found" });
    }
});

app.post("/update/:filename", (req, res) => {
    const oldFilePath = path.join(__dirname, "files", req.params.filename);
    const newFilePath = path.join(__dirname, "files", req.body.newTitle);

    fs.writeFile(oldFilePath, req.body.description, (err) => {
        if (err) {
            console.error("Error updating file:", err);
            return res.status(500).send("Error saving updated content.");
        }

        // Rename file if title is changed
        if (req.params.filename !== req.body.newTitle) {
            fs.rename(oldFilePath, newFilePath, (renameErr) => {
                if (renameErr) {
                    console.error("Error renaming file:", renameErr);
                    return res.status(500).send("Error renaming file.");
                }
                res.redirect(`/files/${req.body.newTitle}`);
            });
        } else {
            res.redirect(`/files/${req.params.filename}`);
        }
    });
});



app.listen(3000, () => {
    console.log("Server is running on port 3000...");
});
