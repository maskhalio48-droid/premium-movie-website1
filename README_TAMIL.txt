Tamilflix — Updated website files

இந்த ZIP-ல் உள்ளவை:
- index.html
- style.css
- script.js
- admin.js
- download.js
- request.js
- movie_requests_setup.sql
- supabase-config.js (உங்கள் Supabase URL மற்றும் publishable key-ஐ நீங்கள் கொடுத்ததைப் பயன்படுத்துகிறது)

முக்கியம்:
1. GitHub repository-யில் உள்ள பழைய files-க்கு backup எடுத்துக்கொள்ளுங்கள்.
2. ZIP-இல் உள்ள website files-ஐ repository root-ல் upload செய்யுங்கள்.
3. movie_requests_setup.sql-ஐ Supabase SQL Editor-ல் இயக்குவதற்கு முன், அதில் உள்ள admin@example.com-ஐ உங்கள் Tamilflix admin login email-ஆல் மாற்றுங்கள்.
4. Supabase Table Editor / Auth policies சரியாக அமைந்திருக்க வேண்டும். இந்த ZIP மட்டும் Supabase database schema-ஐ தானாக உருவாக்காது.
5. Admin panel-இல் title data இன்னும் browser-local storage-ஐப் பயன்படுத்துகிறது; இது பாதுகாப்பான shared multi-user title management அல்ல. Movie requests-க்கு SQL setup உள்ளது.
6. Download என்பது அனுமதி உள்ள direct video URL-களுக்கு மட்டுமே. இது DRM-ஐ bypass செய்யாது.
7. Supabase URL மற்றும் publishable key browser-ல் பயன்படுத்துவதற்கானவை. service_role/secret key-ஐ website files-ல் ஒருபோதும் சேர்க்க வேண்டாம்.

இது நீங்கள் வழங்கிய source-ஐ அடிப்படையாகக் கொண்ட update package; உங்கள் GitHub Pages site-ல் deploy செய்து login, request flow, playback ஆகியவற்றைச் சோதிக்க வேண்டும்.
