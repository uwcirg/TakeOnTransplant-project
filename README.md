# Take on Transplant Project Site

## To test/view site locally

1. Install Python 3
2. Run python3 -m http.server 8000 at the root directory
3. Go to http://localhost:8000/ 

## To update styling
SASS is used to compile scss to css.  To install SASS please see [here](https://sass-lang.com/install/). Please NOTE: to run latest version of SASS, a Node environment of >20 is required.
1.  Under `scss` directory, update code in the relevant scss file
2.  At the root directory, run this command: `sass assets/scss/[filename].scss assets/css/main.css --style=compressed`


## To manage translations
1. Add attribute, data-i18n, or data-i18n-html(for text containing HTML) for newly added element(s)
2. Update `js/translations.json` 
