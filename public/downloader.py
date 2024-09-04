import json, os
import urllib.request

IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'heif', 'heic', 'tif', 'tiff', 'webp']

def download_image(image_url, project_url=None):
    """Download remote image."""
    if not image_url:
        return
    image_name = image_url.split('/')[-1].split(':')[-1]
    if '?' in image_name:
        image_name = image_name.split('?')[0]
    # Default to jpeg when extension is missing
    if '.' not in image_name:
        image_name += '.jpg'
    # Check if the URL has an image format
    elif image_name.split('.')[-1].lower() not in IMAGE_FORMATS:
        print('Missing format: ', image_url, project_url)
        return
    # Check if file exists
    if os.path.exists(f'images/{image_name}'):
        #print(f'Skipping {image_name}')
        return
    try:
        urllib.request.urlretrieve(image_url, f'images/{image_name}')
        print('Saved:', image_name)
    except urllib.error.URLError as e:
        print('Could not download: ', image_url, project_url, e)
    except Exception as e:
        print('Could not download: ', image_url, project_url)

# Read the JSON file and fetch all the resources
json_file = open('projects.json', 'r')
with json_file:
    data = json.load(json_file)
    for project in data['projects']:
        download_image(project['image_url'], project['url'])
