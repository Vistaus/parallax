import QtQuick 2.12
import QtQuick.Layouts 1.12
import QtQuick.Controls 2.12
import QtGraphicalEffects 1.12
import Lomiri.Components 1.3

Page {
    id: home
    // Force hide default header by providing a dummy invisible item
    header: Item { visible: false; height: 0 }


    // Background Gradient
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: theme.palette.normal.base }
            GradientStop { position: 1.0; color: theme.palette.normal.background }
        }
    }

    property var trustModels: []
    signal requestAppDetail(var appModel)

    // Data Aggregation
    property int totalApps: trustModels.length
    property int lowCount: trustModels.filter(m => m.trust.riskLevel === "low").length
    property int medCount: trustModels.filter(m => m.trust.riskLevel === "medium").length
    property int highCount: trustModels.filter(m => m.trust.riskLevel === "high").length

    // Sorted Model
    property var sortedModels: trustModels.slice().sort(function(a,b){
        const order = { "high": 0, "medium": 1, "low": 2 }
        const rDiff = order[a.trust.riskLevel] - order[b.trust.riskLevel]
        if (rDiff !== 0) return rDiff
        return a.displayName.localeCompare(b.displayName)
    })

    // Main Content Area (Constrained Width)
    Item {
        id: contentArea
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        width: Math.min(parent.width, units.gu(80))
        anchors.horizontalCenter: parent.horizontalCenter
        
        ListView {
            id: list
            anchors.fill: parent
            model: sortedModels
            clip: true
            spacing: units.gu(1) // Gap between cards

            // Dashboard Header (Inside ListView to scroll with it)
            header: Column {
                width: parent.width
                spacing: units.gu(3)
                bottomPadding: units.gu(2)
                topPadding: units.gu(2)
                
                // --- Moved Header (Logo) ---
                Item {
                    width: parent.width
                    height: units.gu(7)
                    
                    Image {
                        source: "../assets/logo.svg"
                        height: units.gu(4)
                        width: units.gu(4)
                        anchors.centerIn: parent
                        fillMode: Image.PreserveAspectFit
                        smooth: true
                        mipmap: true
                    }
                }
                // ---------------------------

                Item {
                    width: parent.width
                    height: units.gu(22)

                    Canvas {
                        // ... (Pie chart code unchanged) ...
                        id: pie
                        anchors.centerIn: parent
                        width: units.gu(20)
                        height: units.gu(20)
                        
                        property int _trigger: lowCount + medCount + highCount
                        on_TriggerChanged: requestPaint()

                        onPaint: {
                            var ctx = getContext("2d")
                            ctx.reset()
                            var cx = width/2, cy = height/2, r = width/2
                            
                            var total = lowCount + medCount + highCount
                            // Handle Empty State: Draw Gray Ring
                            if (total === 0) {
                                ctx.beginPath()
                                ctx.arc(cx, cy, r, 0, 2*Math.PI)
                                ctx.fillStyle = theme.palette.normal.base
                                ctx.fill()
                                
                                ctx.beginPath()
                                ctx.arc(cx, cy, r * 0.80, 0, 2*Math.PI) // Thinner ring for empty state
                                ctx.fillStyle = theme.palette.normal.background
                                ctx.fill()
                                return
                            }

                            var start = -Math.PI/2
                            
                            function drawSlice(count, color) {
                                if (count <= 0) return
                                var angle = (count/total) * 2 * Math.PI
                                ctx.beginPath()
                                ctx.moveTo(cx, cy)
                                ctx.arc(cx, cy, r, start, start + angle)
                                ctx.fillStyle = color
                                ctx.fill()
                                start += angle
                            }

                            drawSlice(highCount, "#F44336")
                            drawSlice(medCount, "#FFC107")
                            drawSlice(lowCount, "#4CAF50")
                            
                            ctx.beginPath()
                            ctx.arc(cx, cy, r * 0.65, 0, 2*Math.PI)
                            ctx.fillStyle = theme.palette.normal.background
                            ctx.fill()
                        }
                    }
                    
                    Column {
                        anchors.centerIn: parent
                        spacing: 0
                        Label { 
                            text: totalApps 
                            font.pixelSize: units.gu(6)
                            font.bold: true
                            anchors.horizontalCenter: parent.horizontalCenter
                            color: theme.palette.normal.backgroundText
                        }
                        Label { 
                            text: i18n.tr("Apps Protected") 
                            font.pixelSize: units.gu(1.2)
                            color: theme.palette.normal.backgroundText
                            anchors.horizontalCenter: parent.horizontalCenter
                        }
                    }
                }
                
                // Risk Counts Row (Hide if empty)
                RowLayout {
                    visible: totalApps > 0
                    anchors.horizontalCenter: parent.horizontalCenter
                    spacing: units.gu(2)
                    
                    Repeater {
                        model: [
                            {label: "Low", count: lowCount, color: "#4CAF50"},
                            {label: "Medium", count: medCount, color: "#FFC107"},
                            {label: "High", count: highCount, color: "#F44336"}
                        ]
                        
                        Row {
                            spacing: units.gu(1)
                            Rectangle {
                                width: units.gu(1.5)
                                height: units.gu(1.5)
                                radius: width/2
                                color: modelData.color
                                anchors.verticalCenter: parent.verticalCenter
                            }
                            Label {
                                text: modelData.label + ": " + modelData.count
                                font.bold: true
                                color: theme.palette.normal.backgroundText
                                anchors.verticalCenter: parent.verticalCenter
                            }
                        }
                    }
                }
                
                Label {
                    text: i18n.tr("Installed Applications")
                    font.bold: true
                    font.pixelSize: units.gu(1.5)
                    x: units.gu(1)
                    visible: totalApps > 0
                }
                
                // Empty State Placeholder
                Column {
                    visible: totalApps === 0
                    anchors.horizontalCenter: parent.horizontalCenter
                    spacing: units.gu(2)
                    topPadding: units.gu(4)
                    
                    Icon {
                        name: "search" // Or another appropriate icon available in Lomiri
                        width: units.gu(6)
                        height: units.gu(6)
                        color: theme.palette.normal.baseText
                        anchors.horizontalCenter: parent.horizontalCenter
                        opacity: 0.5
                    }
                    
                    Label {
                        text: i18n.tr("No applications found")
                        font.pixelSize: units.gu(1.5)
                        color: theme.palette.normal.backgroundText
                        anchors.horizontalCenter: parent.horizontalCenter
                        opacity: 0.7
                    }
                }
            }

            delegate: Item {
                width: parent.width
                height: units.gu(10)
                
                Rectangle {
                    anchors.fill: parent
                    anchors.margins: units.gu(0.5)
                    color: theme.palette.normal.background
                    radius: units.gu(1)
                    border.color: Qt.darker(theme.palette.normal.base, 1.05)
                    border.width: 1
                    
                    MouseArea {
                        anchors.fill: parent
                        onClicked: home.requestAppDetail(modelData)
                        hoverEnabled: true
                        onEntered: parent.color = Qt.darker(theme.palette.normal.background, 1.02)
                        onExited: parent.color = theme.palette.normal.background
                    }

                    RowLayout {
                        anchors.fill: parent
                        anchors.margins: units.gu(1)
                        spacing: units.gu(2)
                        
                        // Centering items vertically in the Layout
                        // Layouts automatically center if not filled, but let's be explicit with Alignment
                        
                        Item {
                            Layout.preferredWidth: units.gu(6)
                            Layout.preferredHeight: units.gu(6)
                            Layout.alignment: Qt.AlignVCenter // Center Icon

                            Image {
                                id: appIcon
                                anchors.fill: parent
                                source: modelData.iconPath || ""
                                fillMode: Image.PreserveAspectFit
                                visible: false
                                smooth: true
                                mipmap: true
                            }
                            // ... (Masking code same as before) ...
                            Rectangle {
                                id: mask
                                anchors.fill: parent
                                radius: units.gu(1.5)
                                visible: false
                            }
                            OpacityMask {
                                anchors.fill: parent
                                source: appIcon
                                maskSource: mask
                            }
                            Rectangle {
                                anchors.fill: parent
                                color: "transparent"
                                border.color: theme.palette.normal.base
                                border.width: 1
                                radius: units.gu(1.5)
                            }
                            Rectangle {
                                anchors.fill: parent
                                color: theme.palette.normal.base
                                visible: appIcon.status !== Image.Ready
                                radius: units.gu(1.5)
                                Label { 
                                    text: (modelData.displayName || "?").charAt(0)
                                    anchors.centerIn: parent 
                                    font.bold: true
                                    color: theme.palette.normal.baseText
                                }
                            }
                        }

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: units.gu(0.5)
                            Layout.alignment: Qt.AlignVCenter // Center Text Column

                            Label {
                                text: modelData.displayName
                                font.bold: true
                                font.pixelSize: units.gu(1.8)
                                Layout.fillWidth: true
                                elide: Text.ElideRight
                            }
                            
                            Label {
                                text: modelData.maintainer.name || "Unknown Publisher"
                                color: theme.palette.normal.backgroundText
                                font.pixelSize: units.gu(1.5)
                                Layout.fillWidth: true
                                elide: Text.ElideRight
                                maximumLineCount: 1
                            }
                            
                            Row {
                                 spacing: units.gu(0.7)
                                 Rectangle {
                                     width: units.gu(1.2)
                                     height: units.gu(1.2)
                                     radius: width/2
                                     color: {
                                        var r = modelData.trust.riskLevel
                                        if(r === "high") return "#F44336"
                                        if(r === "medium") return "#FFC107"
                                        return "#4CAF50"
                                     }
                                     anchors.verticalCenter: parent.verticalCenter
                                 }
                                 Label {
                                     text: modelData.trust.riskLevel.charAt(0).toUpperCase() + modelData.trust.riskLevel.slice(1) + " Risk"
                                     font.pixelSize: units.gu(1.2)
                                     color: theme.palette.normal.backgroundText
                                     anchors.verticalCenter: parent.verticalCenter
                                 }
                            }
                        }
                        
                        Icon {
                            name: "go-next"
                            width: units.gu(2)
                            height: units.gu(2)
                            color: theme.palette.normal.backgroundText
                            Layout.alignment: Qt.AlignVCenter // Center Arrow
                        }
                    }
                }
            }
        }
    }
}
