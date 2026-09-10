-- tambah kolom, boleh null karena data lama belum punya pemilik
ALTER TABLE movies ADD COLUMN user_id INTEGER;

-- hubungkan ke table user
ALTER TABLE movies  
    ADD CONSTRAINT fk_movies_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE;

-- index untuk mempercepat query "film milik user ini"
CREATE INDEX idex_movies_user_id ON movies(user_id);