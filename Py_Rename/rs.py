import os
substring = 'Screenshot_'
directory = './images/'
for filename in os.listdir(directory):
    if substring in filename:
        new_filename = filename.replace(substring, "")
        old_file = os.path.join(directory, filename)
        new_file = os.path.join(directory, new_filename)
        os.rename(old_file, new_file)
        print(f'Переименован: "{filename}" -> "{new_filename}"')