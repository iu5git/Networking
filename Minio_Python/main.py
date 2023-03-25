from advanced_example import MinioClass

if __name__ == '__main__':
    username = 'user1'
    minio = MinioClass()
    minio.add_user(username)
    minio.add_note(username, 'title1')

    title_list = minio.get_note_list(username)
    for title in title_list:
        print(title, ": ", minio.get_note(username, title))




