import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import QtGraphicalEffects 1.12
import Lomiri.Components 1.3

Page {
    id: detail
    

    // Force hide default header by providing a dummy invisible item
    header: Item { visible: false; height: 0 }
    
    property var model    // AppTrustModel injected
    
    // Helper to extract email
    function getEmail(maintainerString) {
        if (!maintainerString) return i18n.tr("Unknown")
        var match = maintainerString.match(/<([^>]+)>/)
        return match ? match[1] : i18n.tr("No Email")
    }

    function getName(maintainerString) {
        if (!maintainerString) return i18n.tr("Unknown")
        return maintainerString.replace(/<[^>]+>/, "").trim()
    }
    
    function riskColor(level) {
        if (level === "high") return "#F44336"
        if (level === "medium") return "#FFC107"
        return "#4CAF50"
    }

    // Background Gradient
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: theme.palette.normal.base } // Light gray top
            GradientStop { position: 1.0; color: theme.palette.normal.background } // White bottom
        }
    }

    Flickable {
        id: flick
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        contentHeight: column.height + units.gu(4)
        clip: true

        Column {
            id: column
            // Responsive Width Constraint: Max 80 GU, otherwise fill parent
            width: Math.min(parent.width, units.gu(80))
            anchors.horizontalCenter: parent.horizontalCenter
            
            spacing: units.gu(2)
            anchors.top: parent.top
            anchors.topMargin: units.gu(2)
            
            // --- Moved Header (Back + Title) ---
            Item {
                width: parent.width
                height: units.gu(8) // Slightly taller to accommodate padding
                
                // Pill Header
                Rectangle {
                    height: units.gu(6)
                    width: headerRow.implicitWidth + units.gu(4) // Dynamic width
                    anchors.left: parent.left
                    anchors.margins: units.gu(2) // Margins
                    anchors.verticalCenter: parent.verticalCenter
                    
                    radius: height / 2
                    color: "white" // White background as requested
                    border.color: Qt.darker(theme.palette.normal.base, 1.1)
                    border.width: 1

                    RowLayout {
                        id: headerRow
                        anchors.centerIn: parent
                        spacing: units.gu(1.5)
                        
                        // Back Button
                        Icon {
                            name: "back"
                            Layout.preferredHeight: units.gu(2.5)
                            Layout.preferredWidth: units.gu(2.5)
                            color: theme.palette.normal.backgroundText
                            
                            MouseArea {
                                anchors.fill: parent
                                onClicked: pageStack.pop()
                            }
                        }
                        
                        // Separator
                        Rectangle {
                            Layout.preferredWidth: 1
                            Layout.preferredHeight: units.gu(2.5)
                            color: theme.palette.normal.baseText
                            opacity: 0.3
                        }

                        // Title
                        Label {
                            text: detail.model.displayName
                            font.bold: true
                            font.pixelSize: units.gu(1.8)
                            color: theme.palette.normal.backgroundText
                            Layout.maximumWidth: units.gu(30)
                            elide: Text.ElideRight
                        }
                    }
                }
            }
            // ------------------------------------
            
            // 1. App Header (Icon + Info)
            RowLayout {
                width: parent.width - units.gu(4) // Account for margins if not using anchors
                anchors.horizontalCenter: parent.horizontalCenter
                spacing: units.gu(2)

                Item {
                    Layout.preferredWidth: units.gu(8)
                    Layout.preferredHeight: units.gu(8)

                    Image {
                        id: appIcon
                        anchors.fill: parent
                        source: model.iconPath || ""
                        fillMode: Image.PreserveAspectFit
                        visible: false
                        smooth: true
                        mipmap: true
                    }

                    Rectangle {
                        id: mask
                        anchors.fill: parent
                        radius: units.gu(2) // Slightly softer roundness
                        visible: false
                    }

                    OpacityMask {
                        anchors.fill: parent
                        source: appIcon
                        maskSource: mask
                    }

                    // Border Frame
                    Rectangle {
                        anchors.fill: parent
                        color: "transparent"
                        border.color: theme.palette.normal.base
                        border.width: 1
                        radius: units.gu(2)
                    }

                    // Fallback
                    Rectangle {
                        anchors.fill: parent
                        color: theme.palette.normal.base
                        visible: appIcon.status !== Image.Ready
                        radius: units.gu(2)
                        Label { 
                            text: (model.displayName || "?").charAt(0)
                            anchors.centerIn: parent 
                            font.bold: true
                            font.pixelSize: units.gu(3)
                        }
                    }
                }

                ColumnLayout {
                    Layout.fillWidth: true
                    Label {
                        text: model.displayName
                        font.bold: true
                        font.pixelSize: units.gu(3) // Larger Title
                        Layout.fillWidth: true
                        wrapMode: Text.WordWrap
                    }
                    Label {
                        text: i18n.tr("Version: %1").arg(model.version || "N/A")
                        color: theme.palette.normal.backgroundText
                        font.pixelSize: units.gu(1.5)
                    }
                }
            }
            
            // ... (Score and Permissions sections unchanged) ...

            // 2. Parallax Score Card (Animated)
            Rectangle {
                width: parent.width - units.gu(4)
                height: units.gu(22)
                anchors.horizontalCenter: parent.horizontalCenter
                radius: units.gu(1.5) // Increased radius
                color: theme.palette.normal.background
                // Drop Shadow Effect Simulated via Border/Color
                border.color: Qt.darker(theme.palette.normal.base, 1.1)
                border.width: 1

                Column {
                    anchors.centerIn: parent
                    spacing: units.gu(2)

                    Label {
                        text: i18n.tr("Parallax Score")
                        font.bold: true
                        anchors.horizontalCenter: parent.horizontalCenter
                        font.pixelSize: units.gu(1.5)
                    }

                    Item {
                        width: units.gu(12)
                        height: units.gu(12)
                        anchors.horizontalCenter: parent.horizontalCenter

                        Canvas {
                            id: scoreCanvas
                            anchors.fill: parent
                            property real score: model.trust.score
                            property real angle: 0
                            
                            // Animate from 0 to score-angle
                            NumberAnimation on angle {
                                from: 0
                                to: (scoreCanvas.score / 100) * 2 * Math.PI
                                duration: 1500
                                easing.type: Easing.OutCubic
                                running: true
                            }
                            
                            onAngleChanged: requestPaint()

                            onPaint: {
                                var ctx = getContext("2d")
                                ctx.reset()
                                var cx = width/2, cy = height/2, r = width/2 - 5
                                
                                // Background Circle
                                ctx.beginPath()
                                ctx.arc(cx, cy, r, 0, 2*Math.PI)
                                ctx.lineWidth = 10 // Thicker
                                ctx.strokeStyle = theme.palette.normal.base
                                ctx.stroke()

                                // Progress Arc
                                if (angle > 0) {
                                    ctx.beginPath()
                                    ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + angle)
                                    ctx.lineWidth = 10
                                    ctx.strokeStyle = riskColor(model.trust.riskLevel)
                                    ctx.lineCap = "round"
                                    ctx.stroke()
                                }
                            }
                        }
                        
                        Label {
                            text: model.trust.score
                            anchors.centerIn: parent
                            font.bold: true
                            font.pixelSize: units.gu(4) // Larger Score Text
                        }
                    }
                }
            }
            
            // 3. Why this score
             Rectangle {
                width: parent.width - units.gu(4)
                height: whyCol.height + units.gu(4)
                anchors.horizontalCenter: parent.horizontalCenter
                radius: units.gu(1.5)
                color: theme.palette.normal.background
                border.color: Qt.darker(theme.palette.normal.base, 1.1)
                border.width: 1
                
                Column {
                    id: whyCol
                    width: parent.width - units.gu(4)
                    anchors.centerIn: parent
                    spacing: units.gu(1)
                    
                    Label { text: i18n.tr("Why this score?"); font.bold: true; font.pixelSize: units.gu(1.5) }
                    
                    Repeater {
                        model: detail.model.explanations.length > 0 ? detail.model.explanations : [i18n.tr("No signals found.")]
                        Label {
                            text: "• " + modelData
                            wrapMode: Text.WordWrap
                            width: parent.width
                            font.pixelSize: units.gu(1.3)
                        }
                    }
                }
            }

            // 4. Permissions Table
            Rectangle {
                width: parent.width - units.gu(4)
                height: permCol.height + units.gu(4)
                anchors.horizontalCenter: parent.horizontalCenter
                radius: units.gu(1.5)
                color: theme.palette.normal.background
                border.color: Qt.darker(theme.palette.normal.base, 1.1)
                border.width: 1

                Column {
                    id: permCol
                    width: parent.width - units.gu(4)
                    anchors.centerIn: parent
                    spacing: units.gu(1.5)

                    Label { text: i18n.tr("Permissions"); font.bold: true; font.pixelSize: units.gu(1.5) }

                    // Table Rows
                    Repeater {
                        model: [
                            {label: "Network", val: detail.model.permissions.network},
                            {label: "Camera", val: detail.model.permissions.camera},
                            {label: "Microphone", val: detail.model.permissions.microphone},
                            {label: "Location", val: detail.model.permissions.location},
                            {label: "Storage", val: detail.model.permissions.storage}
                        ]
                        
                        RowLayout {
                            width: parent.width
                            Label { 
                                text: modelData.label 
                                Layout.fillWidth: true
                                color: theme.palette.normal.backgroundText
                            }
                            Icon {
                                name: modelData.val ? "tick" : "close"
                                color: modelData.val ? theme.palette.normal.positive : theme.palette.normal.baseText
                                Layout.preferredHeight: units.gu(2.5) // Slightly Larger Icons
                                Layout.preferredWidth: units.gu(2.5)
                            }
                        }
                    }
                }
            }
            
            // 5. Updated Status (Tick + Date)
            Row {
                anchors.left: parent.left; anchors.leftMargin: units.gu(4)
                spacing: units.gu(1)
                Icon { name: "tick"; width: units.gu(2); height: units.gu(2); color: theme.palette.normal.positive }
                Label { 
                    text: i18n.tr("Updated: ") + (model.lastUpdated ? Qt.formatDate(model.lastUpdated, Qt.DefaultLocaleShortDate) : "Recently")
                    color: theme.palette.normal.backgroundText
                }
            }

            // 6. Maintainer Cards (Split)
            RowLayout {
                width: parent.width - units.gu(4)
                anchors.horizontalCenter: parent.horizontalCenter
                spacing: units.gu(2)

                // Name Card
                Rectangle {
                    Layout.fillWidth: true
                    height: units.gu(10) // Taller cards
                    color: theme.palette.normal.background
                    radius: units.gu(1.5)
                    border.color: Qt.darker(theme.palette.normal.base, 1.1)
                    border.width: 1
                    
                    Column {
                        anchors.centerIn: parent
                        width: parent.width - units.gu(2)
                        Label { text: i18n.tr("Maintainer"); font.pixelSize: units.gu(1.2); color: theme.palette.normal.backgroundText }
                        Label { 
                            text: getName(model.maintainer.name)
                            font.bold: true 
                            elide: Text.ElideRight 
                            width: parent.width 
                            horizontalAlignment: Text.AlignLeft
                            font.pixelSize: units.gu(1.5)
                        }
                    }
                }

                // Email Card
                Rectangle {
                    Layout.fillWidth: true
                    height: units.gu(10)
                    color: theme.palette.normal.background
                    radius: units.gu(1.5)
                    border.color: Qt.darker(theme.palette.normal.base, 1.1)
                    border.width: 1

                    Column {
                        anchors.centerIn: parent
                        width: parent.width - units.gu(2)
                        Label { text: i18n.tr("Contact"); font.pixelSize: units.gu(1.2); color: theme.palette.normal.backgroundText }
                        Label { 
                            text: getEmail(model.maintainer.name) 
                            font.bold: true 
                            elide: Text.ElideRight 
                            width: parent.width
                            horizontalAlignment: Text.AlignLeft
                            font.pixelSize: units.gu(1.5)
                        }
                    }
                }
            }
            
            // 7. Footer Info
            RowLayout {
                width: parent.width - units.gu(4)
                anchors.horizontalCenter: parent.horizontalCenter
                spacing: units.gu(2)
                
                Icon {
                    name: "info"
                    Layout.preferredWidth: units.gu(3)
                    Layout.preferredHeight: units.gu(3)
                    color: theme.palette.normal.backgroundText
                    Layout.alignment: Qt.AlignTop
                }
                
                Label {
                    Layout.fillWidth: true
                    text: i18n.tr("Parallax provides information to help you understand app trust. It does not block or monitor apps.")
                    wrapMode: Text.WordWrap
                    font.pixelSize: units.gu(1.2)
                    color: theme.palette.normal.backgroundText
                }
             }
             
             Item { height: units.gu(2) } // Bottom Spacer
        }
    }
}
