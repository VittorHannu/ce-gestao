@echo off
rem gemini_auth.bat
rem Intercepts the URL that Gemini CLI tries to open on Windows.

set "url=%~1"

echo --------------------------------------------------------------------------------
echo --- Gemini Headless Auth (Windows)                                         ---
echo --------------------------------------------------------------------------------
echo STEP 1: Copy the URL below and paste it into your local web browser.
echo.
echo URL: %url%
echo.
echo STEP 2: After you log in, your browser will show a 'This site can’t be reached' error.
echo    This is expected.
echo.
echo STEP 3: Copy the ENTIRE URL from your browser's address bar.
echo.
echo STEP 4: Paste the copied localhost URL below and press Enter.
echo --------------------------------------------------------------------------------
echo.

set /p callback_url="Paste the localhost URL here: "

echo.
echo Attempting to complete authentication...
echo.

rem Assumes curl is available in your PATH.
curl -v "%callback_url%"

echo.
echo --------------------------------------------------------------------------------
echo --- ??? If you see a '200 OK' or similar success message above, it worked. ---
echo --------------------------------------------------------------------------------
