!macro customUnInstall
  ${ifNot} ${isUpdated}
    RMDir /r "$LOCALAPPDATA\glopuploads-updater"
  ${endIf}
!macroend