import listen

mushra = listen.parser.MUSHRA('../example_data/mushra.json')
data = mushra.parse()

print(data)
